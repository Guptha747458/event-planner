import express from 'express';
import { generatePlanWithGemini, refineBudgetWithGemini, regenerateIdeasWithGemini } from './gemini.js';
import { planStorage } from './planStorage.js';

const router = express.Router();

/**
 * POST /api/generate-plan
 * Accepts event metadata, returns JSON containing budget, timeline, vendors, and ideas.
 */
router.post('/generate-plan', async (req, res) => {
  try {
    const metadata = req.body || {};
    // Fallback defaults if fields missing
    const sanitizedMetadata = {
      eventType: metadata.eventType || 'Wedding',
      date: metadata.date || '2026-10-15',
      guestCount: Number(metadata.guestCount) || 100,
      totalBudget: Number(metadata.totalBudget) || 15000,
      city: metadata.city || 'San Francisco, CA',
      stylePreference: metadata.stylePreference || 'Rustic Elegance'
    };

    const plan = await generatePlanWithGemini(sanitizedMetadata);
    // Persist to in-memory store for shareable links
    const saved = planStorage.save(plan);

    return res.status(200).json({
      success: true,
      plan: saved
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
    const { currentBudget, instruction, totalBudget, planId } = req.body || {};

    if (!currentBudget || !instruction) {
      return res.status(400).json({
        success: false,
        message: 'currentBudget and instruction are required.'
      });
    }

    const numericTotal = Number(totalBudget) || Object.values(currentBudget).reduce((a, b) => a + Number(b), 0);
    const refined = await refineBudgetWithGemini(currentBudget, instruction, numericTotal);

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
    const { metadata, planId } = req.body || {};
    const sanitizedMetadata = metadata || {
      eventType: 'Wedding',
      totalBudget: 15000,
      stylePreference: 'Rustic Elegance',
      city: 'San Francisco, CA'
    };

    const freshIdeas = await regenerateIdeasWithGemini(sanitizedMetadata);

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
