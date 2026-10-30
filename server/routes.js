import express from 'express';
import {
  generatePlanWithGemini,
  refineBudgetWithGemini,
  regenerateIdeasWithGemini,
  getGeminiStatus,
  updateGeminiConfig,
  testGeminiConnection
} from './gemini.js';
import { planStorage } from './planStorage.js';

const router = express.Router();

const MAX_TEXT_LENGTH = 160;
const requestTimestamps = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function clientKey(req) {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function rateLimitExpensiveRequests(req, res, next) {
  const now = Date.now();
  const key = clientKey(req);
  const recent = (requestTimestamps.get(key) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again in a minute.'
    });
  }
  recent.push(now);
  requestTimestamps.set(key, recent);
  return next();
}

function text(value, fallback, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function boundedNumber(value, fallback, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : fallback;
}

function safeErrorResponse(res, message, error) {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message
  });
}

/**
 * GET /api/api-status
 * Check current Gemini AI status and active model.
 */
router.get('/api-status', (req, res) => {
  return res.status(200).json({
    success: true,
    ...getGeminiStatus()
  });
});

/**
 * POST /api/set-api-key
 * Update Gemini API key and/or model on the fly.
 */
router.post('/set-api-key', async (req, res) => {
  try {
    const { apiKey, model, testFirst = true } = req.body || {};
    if (apiKey !== undefined && (typeof apiKey !== 'string' || apiKey.trim().length > 256)) {
      return res.status(400).json({ success: false, message: 'API key is invalid.' });
    }
    if (model !== undefined && (typeof model !== 'string' || model.trim().length > 100)) {
      return res.status(400).json({ success: false, message: 'Model name is invalid.' });
    }

    if (!apiKey && !model) {
      return res.status(400).json({
        success: false,
        message: 'apiKey or model is required.'
      });
    }

    if (testFirst && apiKey) {
      const testResult = await testGeminiConnection(apiKey, model);
      if (!testResult.ok) {
        return res.status(400).json({
          success: false,
          message: `API Key test failed: ${testResult.error}`,
          error: testResult.error
        });
      }
    }

    const updated = updateGeminiConfig({ apiKey, model });
    return res.status(200).json({
      success: true,
      message: 'Gemini API settings updated successfully!',
      ...updated
    });
  } catch (err) {
    return safeErrorResponse(res, 'Failed to update API settings.', err);
  }
});

/**
 * POST /api/test-api-key
 * Test an API key without applying it
 */
router.post('/test-api-key', async (req, res) => {
  const { apiKey, model } = req.body || {};
  if (typeof apiKey !== 'string' || apiKey.trim().length > 256) {
    return res.status(400).json({ success: false, message: 'API key is invalid.' });
  }
  if (model !== undefined && (typeof model !== 'string' || model.trim().length > 100)) {
    return res.status(400).json({ success: false, message: 'Model name is invalid.' });
  }
  const result = await testGeminiConnection(apiKey, model);
  return res.status(result.ok ? 200 : 400).json({
    success: result.ok,
    message: result.ok ? 'Connection successful!' : result.error,
    ...result
  });
});

/**
 * POST /api/generate-plan
 * Accepts event metadata, returns JSON containing budget, timeline, vendors, and ideas.
 */
router.post('/generate-plan', rateLimitExpensiveRequests, async (req, res) => {
  try {
    const metadata = req.body || {};
    const options = {
      apiKey: req.headers['x-gemini-api-key'] || metadata.apiKey,
      model: metadata.model
    };

    // Fallback defaults if fields missing
    const sanitizedMetadata = {
      eventType: text(metadata.eventType, 'Wedding'),
      date: text(metadata.date, '2026-10-15', 30),
      guestCount: boundedNumber(metadata.guestCount, 100, 1, 100000),
      totalBudget: boundedNumber(metadata.totalBudget, 15000, 1, 100000000),
      city: text(metadata.city, 'San Francisco, CA'),
      stylePreference: text(metadata.stylePreference, 'Rustic Elegance')
    };

    const plan = await generatePlanWithGemini(sanitizedMetadata, options);
    // Persist to in-memory store for shareable links
    const saved = planStorage.save(plan);

    return res.status(200).json({
      success: true,
      plan: saved,
      isFallback: !!plan._isFallback,
      fallbackReason: plan._fallbackReason || null
    });
  } catch (error) {
    return safeErrorResponse(res, 'Failed to generate plan. Please try again.', error);
  }
});

/**
 * POST /api/refine-budget
 * Accepts current allocation + user instruction, returns adjusted numbers.
 */
router.post('/refine-budget', rateLimitExpensiveRequests, async (req, res) => {
  try {
    const { currentBudget, instruction, totalBudget, planId, model, apiKey } = req.body || {};
    const options = {
      apiKey: req.headers['x-gemini-api-key'] || apiKey,
      model
    };

    if (!currentBudget || !instruction) {
      return res.status(400).json({
        success: false,
        message: 'currentBudget and instruction are required.'
      });
    }

    if (
      typeof currentBudget !== 'object' ||
      Array.isArray(currentBudget) ||
      Object.keys(currentBudget).length > 20 ||
      typeof instruction !== 'string' ||
      instruction.trim().length > 1000
    ) {
      return res.status(400).json({ success: false, message: 'Budget or instruction is invalid.' });
    }
    const currentBudgetTotal = Object.values(currentBudget).reduce((sum, value) => {
      const amount = Number(value);
      return sum + (Number.isFinite(amount) && amount >= 0 ? amount : 0);
    }, 0);
    const numericTotal = boundedNumber(totalBudget, currentBudgetTotal, 1, 100000000);
    const refined = await refineBudgetWithGemini(currentBudget, instruction, numericTotal, options);

    if (planId && planStorage.has(planId)) {
      const existing = planStorage.get(planId);
      existing.budget = refined;
      planStorage.save(existing);
    }

    return res.status(200).json({
      success: true,
      budget: refined
    });
  } catch (error) {
    return safeErrorResponse(res, 'Failed to refine budget.', error);
  }
});

/**
 * POST /api/regenerate-ideas
 * Accepts event context, returns fresh set of 6 ideas.
 */
router.post('/regenerate-ideas', rateLimitExpensiveRequests, async (req, res) => {
  try {
    const { metadata, planId, model, apiKey } = req.body || {};
    const options = {
      apiKey: req.headers['x-gemini-api-key'] || apiKey,
      model
    };
    const sanitizedMetadata = metadata || {
      eventType: 'Wedding',
      totalBudget: 15000,
      stylePreference: 'Rustic Elegance',
      city: 'Austin, TX'
    };

    const freshIdeas = await regenerateIdeasWithGemini(sanitizedMetadata, options);

    if (planId && planStorage.has(planId)) {
      const existing = planStorage.get(planId);
      existing.ideas = freshIdeas;
      planStorage.save(existing);
    }

    return res.status(200).json({
      success: true,
      ideas: freshIdeas
    });
  } catch (error) {
    return safeErrorResponse(res, 'Failed to regenerate ideas.', error);
  }
});

/**
 * GET /api/plan/:id
 * Retrieve saved plan by shareable ID.
 */
router.get('/plan/:id', (req, res) => {
  const plan = planStorage.get(req.params.id);
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Plan not found.'
    });
  }
  return res.status(200).json({
    success: true,
    plan
  });
});

/**
 * POST /api/plan
 * Save or update existing plan.
 */
router.post('/plan', (req, res) => {
  const planData = req.body;
  if (!planData) {
    return res.status(400).json({ success: false, message: 'Plan data required.' });
  }
  const saved = planStorage.save(planData);
  return res.status(200).json({
    success: true,
    plan: saved
  });
});

export default router;
