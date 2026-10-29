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
    console.error('Error updating API key:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update API settings.',
      error: err.message
    });
  }
});

/**
 * POST /api/test-api-key
 * Test an API key without applying it
 */
router.post('/test-api-key', async (req, res) => {
  const { apiKey, model } = req.body || {};
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
router.post('/generate-plan', async (req, res) => {
  try {
    const metadata = req.body || {};
    const options = {
      apiKey: req.headers['x-gemini-api-key'] || metadata.apiKey,
      model: metadata.model
    };

    // Fallback defaults if fields missing
    const sanitizedMetadata = {
      eventType: metadata.eventType || 'Wedding',
      date: metadata.date || '2026-10-15',
      guestCount: Number(metadata.guestCount) || 100,
      totalBudget: Number(metadata.totalBudget) || 15000,
      city: metadata.city || 'San Francisco, CA',
      stylePreference: metadata.stylePreference || 'Rustic Elegance'
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
    console.error('Error generating plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate plan. Please try again.',
      error: error.message
    });
  }
});

/**
 * POST /api/refine-budget
 * Accepts current allocation + user instruction, returns adjusted numbers.
 */
router.post('/refine-budget', async (req, res) => {
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

    const numericTotal = Number(totalBudget) || Object.values(currentBudget).reduce((a, b) => a + Number(b), 0);
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
    console.error('Error refining budget:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refine budget.',
      error: error.message
    });
  }
});

/**
 * POST /api/regenerate-ideas
 * Accepts event context, returns fresh set of 6 ideas.
 */
router.post('/regenerate-ideas', async (req, res) => {
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
    console.error('Error regenerating ideas:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to regenerate ideas.',
      error: error.message
    });
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
