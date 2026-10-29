import { GoogleGenAI, Type } from '@google/genai';
import { generateFallbackPlan, generateFallbackIdeas } from './fallbackPlan.js';

// Lazy-initialized Gemini client
let geminiClient = null;

// Track real-time API health and issues
const lastGeminiStatus = {
  status: 'unknown', // 'active' | 'server_issue' | 'offline_fallback'
  lastUsedModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  lastError: null,
  lastSuccessTime: null
};

function getActiveModel(overrideModel) {
  return overrideModel || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
}

/**
 * Executes a promise with an enforced timeout so requests never hang
 */
function callWithTimeout(promise, ms = 4500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Gemini API call timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

function getGeminiClient(customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  if (customApiKey) {
    return new GoogleGenAI({ apiKey: customApiKey });
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

/**
 * Returns current Gemini API configuration and status
 */
export function getGeminiStatus() {
  const currentKey = process.env.GEMINI_API_KEY;
  const isConfigured = !!(currentKey && currentKey !== 'your_gemini_api_key_here');
  return {
    configured: isConfigured,
    model: getActiveModel(),
    status: isConfigured ? (lastGeminiStatus.status === 'server_issue' ? 'server_issue' : 'active') : 'offline_fallback',
    lastError: lastGeminiStatus.lastError,
    lastSuccessTime: lastGeminiStatus.lastSuccessTime
  };
}

/**
 * Update Gemini API configuration dynamically at runtime
 */
export function updateGeminiConfig({ apiKey, model }) {
  if (apiKey) {
    process.env.GEMINI_API_KEY = apiKey.trim();
    geminiClient = null; // force recreation
  }
  if (model) {
    process.env.GEMINI_MODEL = model.trim();
  }
  return getGeminiStatus();
}

/**
 * Test connectivity with a specific key and model
 */
export async function testGeminiConnection(apiKey, model) {
  const testKey = apiKey || process.env.GEMINI_API_KEY;
  const testModel = getActiveModel(model);
  if (!testKey || testKey === 'your_gemini_api_key_here') {
    return { ok: false, error: 'No API key provided.' };
  }
  try {
    const testClient = new GoogleGenAI({ apiKey: testKey });
    const response = await callWithTimeout(
      testClient.models.generateContent({
        model: testModel,
        contents: 'Ping test. Reply with "pong" only.'
      }),
      5000
    );
    lastGeminiStatus.status = 'active';
    lastGeminiStatus.lastError = null;
    lastGeminiStatus.lastSuccessTime = new Date().toISOString();
    return { ok: true, text: response?.text || 'pong', model: testModel };
  } catch (err) {
    lastGeminiStatus.status = 'server_issue';
    lastGeminiStatus.lastError = err.message;
    return { ok: false, error: err.message, model: testModel };
  }
}

/**
 * Gemini Tool / Function declarations for structured event planning
 */
export const eventPlanningTools = [
  {
    functionDeclarations: [
      {
        name: 'set_budget_allocation',
        description: 'Set numerical currency allocation across the 6 core event categories summing to total budget',
        parameters: {
          type: Type.OBJECT,
          properties: {
            venue: { type: Type.NUMBER, description: 'Amount for venue rental and location costs' },
            catering: { type: Type.NUMBER, description: 'Amount for food, beverages, and banquet service' },
            decor: { type: Type.NUMBER, description: 'Amount for florals, lighting, linens, and aesthetic rentals' },
            photography: { type: Type.NUMBER, description: 'Amount for photographer, videographer, and photo booth' },
            attire: { type: Type.NUMBER, description: 'Amount for clothing, styling, hair, makeup, or special favors' },
            misc: { type: Type.NUMBER, description: 'Amount for permits, invitations, audio/DJ, gifts, or contingency buffer' }
          },
          required: ['venue', 'catering', 'decor', 'photography', 'attire', 'misc']
        }
      },
      {
        name: 'create_timeline_tasks',
        description: 'Generate vertical milestone tasks from Today to Event Day grouped by phase',
        parameters: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  phase: { type: Type.STRING, description: 'e.g. 6 Months Out, 3 Months Out, 1 Month Out, 1 Week Out, Event Day' },
                  category: { type: Type.STRING },
                  priority: { type: Type.STRING, description: 'Critical, High, Medium, or Low' },
                  completed: { type: Type.BOOLEAN },
                  dueDate: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ['id', 'title', 'phase', 'category', 'priority', 'completed', 'notes']
              }
            }
          },
          required: ['tasks']
        }
      },
      {
        name: 'suggest_vendors',
        description: 'Provide categorized vendor checklist matching the event location, style, and budget',
        parameters: {
          type: Type.OBJECT,
          properties: {
            vendors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'Venue, Caterer, Photographer, Florist, DJ/Band, Officiant, Rentals' },
                  name: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  actualCost: { type: Type.NUMBER },
                  status: { type: Type.STRING, description: 'Not Contacted, Reached Out, Booked, or Deposit Paid' },
                  contact: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ['id', 'category', 'name', 'estimatedCost', 'status', 'notes']
              }
            }
          },
          required: ['vendors']
        }
      },
      {
        name: 'suggest_event_ideas',
        description: 'Provide 6 unique, creative surprise-me concepts with DIY budget-saving tips',
        parameters: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  estimatedCost: { type: Type.STRING },
                  description: { type: Type.STRING },
                  diyTip: { type: Type.STRING },
                  highlight: { type: Type.STRING }
                },
                required: ['id', 'title', 'tagline', 'estimatedCost', 'description', 'diyTip', 'highlight']
              }
            }
          },
          required: ['ideas']
        }
      }
    ]
  }
];

/**
 * Generate full event plan via Gemini (with 1 retry on malformed JSON + fallback)
 */
export async function generatePlanWithGemini(metadata, options = {}) {
  const client = getGeminiClient(options.apiKey);
  const modelToUse = getActiveModel(options.model);

  if (!client) {
    console.log('[Gemini] No GEMINI_API_KEY detected. Using intelligent procedural fallback plan.');
    lastGeminiStatus.status = 'offline_fallback';
    const fallback = generateFallbackPlan(metadata);
    fallback._isFallback = true;
    fallback._fallbackReason = 'No API key provided. Using offline procedural AI engine.';
    return fallback;
  }

  const {
    eventType = 'Wedding',
    date = '2026-10-15',
    guestCount = 100,
    totalBudget = 15000,
    city = 'San Francisco, CA',
    stylePreference = 'Rustic Elegance'
  } = metadata;

  const prompt = `
You are an expert luxury event planner. Generate a comprehensive, realistic plan for:
- Event Type: ${eventType}
- Target Date: ${date}
- Guest Count: ${guestCount}
- Total Budget: $${totalBudget}
- City/Location: ${city}
- Style & Aesthetic: ${stylePreference}

You must return a strictly valid JSON object matching this schema:
{
  "budget": {
    "venue": number,
    "catering": number,
    "decor": number,
    "photography": number,
    "attire": number,
    "misc": number
  },
  "timeline": [
    {
      "id": "task-1",
      "title": "string",
      "phase": "6 Months Out | 3 Months Out | 1 Month Out | 1 Week Out | Event Day",
      "category": "Venue | Catering | Decor | Photography | Attire | Misc | Coordination",
      "priority": "Critical | High | Medium | Low",
      "completed": false,
      "dueDate": "string",
      "notes": "string"
    }
  ],
  "vendors": [
    {
      "id": "v-1",
      "category": "Venue | Caterer | Photographer | Florist | DJ/Band | Officiant | Rentals",
      "name": "string",
      "estimatedCost": number,
      "actualCost": number,
      "status": "Not Contacted | Reached Out | Booked | Deposit Paid",
      "contact": "string",
      "notes": "string"
    }
  ],
  "ideas": [
    {
      "id": "idea-1",
      "title": "string",
      "tagline": "string",
      "estimatedCost": "string",
      "description": "string",
      "diyTip": "string",
      "highlight": "string"
    }
  ]
}

CRITICAL RULES:
1. The sum of budget values (venue + catering + decor + photography + attire + misc) MUST EQUAL EXACTLY $${totalBudget}.
2. Provide 6 to 8 timeline tasks spanning initial booking to event day.
3. Provide at least 6 categorized vendors (Venue, Caterer, Photographer, Florist, DJ/Band, Rentals).
4. Provide EXACTLY 6 unique, creative, memorable ideas tailored to ${stylePreference} and $${totalBudget} budget with actionable DIY tips.
5. Return ONLY pure JSON. No markdown code blocks, no trailing commas, no extra words.
`;

  // Attempt 1: Call Gemini
  try {
    const response = await callWithTimeout(
      client.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      }),
      6000
    );

    const parsed = parseGeminiJson(response.text);
    if (parsed && isValidPlan(parsed, totalBudget)) {
      lastGeminiStatus.status = 'active';
      lastGeminiStatus.lastError = null;
      lastGeminiStatus.lastSuccessTime = new Date().toISOString();
      return sanitizePlan(parsed, metadata);
    }
    throw new Error('Initial Gemini response failed validation.');
  } catch (err1) {
    console.warn('[Gemini] Attempt 1 failed:', err1.message, '- Retrying with stricter prompt...');

    // Attempt 2: Retry once with stricter repair prompt
    try {
      const retryPrompt = `
SYSTEM ERROR: Your previous response was either not valid JSON or violated constraints.
Format the event plan for ${eventType} in ${city} (Budget: $${totalBudget}, Guests: ${guestCount}) into STRICT raw JSON.
Ensure:
1. venue + catering + decor + photography + attire + misc == ${totalBudget}
2. exactly 6 ideas
3. Valid JSON object only.
`;
      const retryResponse = await callWithTimeout(
        client.models.generateContent({
          model: modelToUse,
          contents: retryPrompt,
          config: {
            responseMimeType: 'application/json'
          }
        }),
        6000
      );

      const parsedRetry = parseGeminiJson(retryResponse.text);
      if (parsedRetry && isValidPlan(parsedRetry, totalBudget)) {
        lastGeminiStatus.status = 'active';
        lastGeminiStatus.lastError = null;
        lastGeminiStatus.lastSuccessTime = new Date().toISOString();
        return sanitizePlan(parsedRetry, metadata);
      }
    } catch (err2) {
      console.warn('[Gemini] Attempt 2 retry failed:', err2.message);
    }

    // Friendly fallback plan if all retries fail
    console.log('[Gemini] Returning resilient fallback plan.');
    lastGeminiStatus.status = 'server_issue';
    lastGeminiStatus.lastError = err1.message;
    const fallbackPlan = generateFallbackPlan(metadata);
    fallbackPlan._isFallback = true;
    fallbackPlan._fallbackReason = err1.message;
    return fallbackPlan;
  }
}

/**
 * Refine budget with Gemini based on natural language instruction
 */
export async function refineBudgetWithGemini(currentBudget, instruction, totalBudget, options = {}) {
  const numericTotal = Number(totalBudget) || Object.values(currentBudget).reduce((a, b) => a + b, 0);
  const client = getGeminiClient(options.apiKey);
  const modelToUse = getActiveModel(options.model);

  if (!client) {
    return localRefineBudget(currentBudget, instruction, numericTotal);
  }

  const prompt = `
You are an expert event financial consultant.
Current budget allocation (Total: $${numericTotal}):
${JSON.stringify(currentBudget, null, 2)}

User Instruction: "${instruction}"

Recalculate the budget allocation across venue, catering, decor, photography, attire, misc according to the instruction.
The sum MUST EQUAL EXACTLY $${numericTotal}.
Return ONLY a valid JSON object with the keys: venue, catering, decor, photography, attire, misc as numbers.
`;

  try {
    const response = await callWithTimeout(
      client.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      }),
      3500
    );
    const parsed = parseGeminiJson(response.text);
    if (parsed && typeof parsed.venue === 'number') {
      lastGeminiStatus.status = 'active';
      lastGeminiStatus.lastError = null;
      lastGeminiStatus.lastSuccessTime = new Date().toISOString();
      return normalizeBudgetSum(parsed, numericTotal);
    }
  } catch (err) {
    console.warn('[Gemini] Budget refinement failed, using local rule engine:', err.message);
    lastGeminiStatus.status = 'server_issue';
    lastGeminiStatus.lastError = err.message;
  }

  return localRefineBudget(currentBudget, instruction, numericTotal);
}

/**
 * Regenerate 6 fresh surprise-me ideas
 */
export async function regenerateIdeasWithGemini(metadata, options = {}) {
  const client = getGeminiClient(options.apiKey);
  const modelToUse = getActiveModel(options.model);
  if (!client) {
    return generateFallbackIdeas(metadata);
  }

  const {
    eventType = 'Wedding',
    totalBudget = 15000,
    stylePreference = 'Rustic Elegance',
    city = 'Austin, TX'
  } = metadata;

  const prompt = `
Generate 6 brand new, completely fresh, creative "Surprise Me" ideas for:
- Event: ${eventType}
- Location: ${city}
- Style: ${stylePreference}
- Budget: $${totalBudget}

Return a JSON array of 6 idea objects with keys:
id, title, tagline, estimatedCost, description, diyTip, highlight.
Return ONLY valid JSON array.
`;

  try {
    const response = await callWithTimeout(
      client.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      }),
      4500
    );

    const parsed = parseGeminiJson(response.text);
    const ideasArray = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.ideas) ? parsed.ideas : null);
    if (ideasArray && ideasArray.length >= 6) {
      lastGeminiStatus.status = 'active';
      lastGeminiStatus.lastError = null;
      lastGeminiStatus.lastSuccessTime = new Date().toISOString();
      return ideasArray.slice(0, 6);
    }
  } catch (err) {
    console.warn('[Gemini] Idea regeneration failed, using local ideas:', err.message);
    lastGeminiStatus.status = 'server_issue';
    lastGeminiStatus.lastError = err.message;
  }

  return generateFallbackIdeas(metadata);
}

/**
 * Helper to clean and parse JSON from LLM text
 */
function parseGeminiJson(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  // Strip code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

function isValidPlan(plan, expectedBudget) {
  if (!plan || typeof plan !== 'object') return false;
  if (!plan.budget || typeof plan.budget !== 'object') return false;
  const categories = ['venue', 'catering', 'decor', 'photography', 'attire', 'misc'];
  const hasCategories = categories.every(cat => typeof plan.budget[cat] === 'number');
  return hasCategories;
}

function sanitizePlan(plan, metadata) {
  const numBudget = Number(metadata.totalBudget) || 15000;
  const normalizedBudget = normalizeBudgetSum(plan.budget, numBudget);

  // Generate fallback only once and reuse for both timeline and vendors if needed
  const needsFallback = !Array.isArray(plan.timeline) || !plan.timeline.length || !Array.isArray(plan.vendors) || !plan.vendors.length;
  const fallback = needsFallback ? generateFallbackPlan(metadata) : null;

  return {
    metadata: {
      ...metadata,
      totalBudget: numBudget,
      guestCount: Number(metadata.guestCount) || 100
    },
    budget: normalizedBudget,
    timeline: Array.isArray(plan.timeline) && plan.timeline.length ? plan.timeline : fallback.timeline,
    vendors: Array.isArray(plan.vendors) && plan.vendors.length ? plan.vendors : fallback.vendors,
    ideas: Array.isArray(plan.ideas) && plan.ideas.length >= 6 ? plan.ideas.slice(0, 6) : generateFallbackIdeas(metadata)
  };
}

function normalizeBudgetSum(budget, targetTotal) {
  const categories = ['venue', 'catering', 'decor', 'photography', 'attire', 'misc'];
  const clean = {};
  categories.forEach(cat => {
    clean[cat] = Math.max(0, Math.round(Number(budget[cat]) || 0));
  });

  const currentTotal = Object.values(clean).reduce((a, b) => a + b, 0);
  if (currentTotal === 0) {
    // Distribute evenly
    const slice = Math.floor(targetTotal / 6);
    categories.forEach(c => { clean[c] = slice; });
    clean.venue += (targetTotal - (slice * 6));
    return clean;
  }

  // Scale proportionally to guarantee exact targetTotal
  let sum = 0;
  categories.forEach((cat, idx) => {
    if (idx === categories.length - 1) {
      clean[cat] = Math.max(0, targetTotal - sum);
    } else {
      clean[cat] = Math.round((clean[cat] / currentTotal) * targetTotal);
      sum += clean[cat];
    }
  });

  return clean;
}

/**
 * Procedural budget refinement rule engine for natural language instructions
 */
export function localRefineBudget(currentBudget, instruction, totalBudget) {
  const updated = {};
  const categories = ['venue', 'catering', 'decor', 'photography', 'attire', 'misc'];
  categories.forEach(c => {
    updated[c] = Number(currentBudget[c]) || 0;
  });

  const lower = (instruction || '').toLowerCase().trim();

  // Pattern 0: "balance", "equalize", "split evenly"
  if (/balance|equalize|even|split evenly/i.test(lower)) {
    const perCat = Math.floor(totalBudget / categories.length);
    categories.forEach((c, idx) => {
      updated[c] = idx === categories.length - 1 ? totalBudget - perCat * (categories.length - 1) : perCat;
    });
    return normalizeBudgetSum(updated, totalBudget);
  }

  // Pattern 1: "cut catering by 20% and move to decor" OR "cut catering by 20%"
  const cutMatch = lower.match(/(?:cut|reduce|decrease|lower|trim|drop)\s+([a-z]+)\s+by\s+(\d+)%(?:\s+(?:and\s+)?(?:move|shift|transfer|put)?\s*(?:to|into)?\s*([a-z]+))?/i);
  if (cutMatch) {
    const fromCat = findCategoryKey(cutMatch[1]);
    const percent = parseFloat(cutMatch[2]) / 100;
    const toCat = cutMatch[3] ? findCategoryKey(cutMatch[3]) : null;

    if (fromCat && updated[fromCat] !== undefined) {
      const amount = Math.round(updated[fromCat] * percent);
      updated[fromCat] = Math.max(0, updated[fromCat] - amount);
      if (toCat && updated[toCat] !== undefined && toCat !== fromCat) {
        updated[toCat] += amount;
      } else {
        // Distribute amount to other categories
        const otherCats = categories.filter(c => c !== fromCat);
        const share = Math.round(amount / otherCats.length);
        otherCats.forEach(c => { updated[c] += share; });
      }
      return normalizeBudgetSum(updated, totalBudget);
    }
  }

  // Pattern 2: "increase/set photography to $3,000"
  const setToMatch = lower.match(/(?:increase|raise|set|boost)\s+([a-z]+)\s+to\s+\$?(\d+)/i);
  if (setToMatch) {
    const targetCat = findCategoryKey(setToMatch[1]);
    const targetAmount = parseInt(setToMatch[2], 10);
    if (targetCat && updated[targetCat] !== undefined) {
      const diff = targetAmount - updated[targetCat];
      updated[targetCat] = targetAmount;
      const otherKeys = categories.filter(k => k !== targetCat);
      const perKeyOffset = Math.round(diff / otherKeys.length);
      otherKeys.forEach(k => {
        updated[k] = Math.max(0, updated[k] - perKeyOffset);
      });
      return normalizeBudgetSum(updated, totalBudget);
    }
  }

  // Pattern 3a: "add 500 to decor from misc"
  const shiftMatchA = lower.match(/(?:add|move|shift|transfer)\s+\$?(\d+)\s+to\s+([a-z]+)\s+from\s+([a-z]+)/i);
  if (shiftMatchA) {
    const amt = parseInt(shiftMatchA[1], 10);
    const toCat = findCategoryKey(shiftMatchA[2]);
    const fromCat = findCategoryKey(shiftMatchA[3]);
    if (toCat && fromCat && updated[toCat] !== undefined && updated[fromCat] !== undefined) {
      updated[toCat] += amt;
      updated[fromCat] = Math.max(0, updated[fromCat] - amt);
      return normalizeBudgetSum(updated, totalBudget);
    }
  }

  // Pattern 3b: "add 500 from misc to decor"
  const shiftMatchB = lower.match(/(?:add|move|shift|transfer)\s+\$?(\d+)\s+from\s+([a-z]+)\s+to\s+([a-z]+)/i);
  if (shiftMatchB) {
    const amt = parseInt(shiftMatchB[1], 10);
    const fromCat = findCategoryKey(shiftMatchB[2]);
    const toCat = findCategoryKey(shiftMatchB[3]);
    if (toCat && fromCat && updated[toCat] !== undefined && updated[fromCat] !== undefined) {
      updated[toCat] += amt;
      updated[fromCat] = Math.max(0, updated[fromCat] - amt);
      return normalizeBudgetSum(updated, totalBudget);
    }
  }

  // Pattern 3c: "add 500 to decor"
  const shiftMatchC = lower.match(/(?:add|move|shift|transfer)\s+\$?(\d+)\s+to\s+([a-z]+)/i);
  if (shiftMatchC) {
    const amt = parseInt(shiftMatchC[1], 10);
    const toCat = findCategoryKey(shiftMatchC[2]);
    if (toCat && updated[toCat] !== undefined) {
      updated[toCat] += amt;
      const otherKeys = categories.filter(k => k !== toCat);
      const perKeyOffset = Math.round(amt / otherKeys.length);
      otherKeys.forEach(k => { updated[k] = Math.max(0, updated[k] - perKeyOffset); });
      return normalizeBudgetSum(updated, totalBudget);
    }
  }

  // Default fallback if no specific regex hit: shift 10% from highest to lowest
  const sorted = [...categories].sort((a, b) => updated[b] - updated[a]);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const shift = Math.round(updated[highest] * 0.1);
  updated[highest] -= shift;
  updated[lowest] += shift;

  return normalizeBudgetSum(updated, totalBudget);
}

function findCategoryKey(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s.includes('venue') || s.includes('location') || s.includes('hall')) return 'venue';
  if (s.includes('cater') || s.includes('food') || s.includes('drink') || s.includes('dinner')) return 'catering';
  if (s.includes('decor') || s.includes('flower') || s.includes('floral') || s.includes('light')) return 'decor';
  if (s.includes('photo') || s.includes('video') || s.includes('camera')) return 'photography';
  if (s.includes('attire') || s.includes('dress') || s.includes('suit') || s.includes('clothes')) return 'attire';
  if (s.includes('misc') || s.includes('other') || s.includes('buffer') || s.includes('dj') || s.includes('music')) return 'misc';
  return null;
}
