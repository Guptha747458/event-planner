import { test, describe } from 'node:test';
import assert from 'node:assert';
import { localRefineBudget } from '../server/gemini.js';

describe('Budget Recalculation Engine (Unit Test)', () => {
  const initialBudget = {
    venue: 5000,
    catering: 4500,
    decor: 2000,
    photography: 1500,
    attire: 1000,
    misc: 1000
  };
  const total = 15000;

  test('Preserves total budget when cutting catering by 20% and shifting to decor', () => {
    const instruction = 'cut catering by 20% and move to decor';
    const refined = localRefineBudget(initialBudget, instruction, total);

    // Sum must equal target total
    const sum = Object.values(refined).reduce((a, b) => a + b, 0);
    assert.strictEqual(sum, total, `Total budget should remain exactly ${total}`);

    // Catering should be reduced
    assert.ok(refined.catering < initialBudget.catering, 'Catering should have decreased');

    // Decor should have increased
    assert.ok(refined.decor > initialBudget.decor, 'Decor should have increased');

    // Expected catering: 4500 - 900 = 3600
    assert.strictEqual(refined.catering, 3600);
    // Expected decor: 2000 + 900 = 2900
    assert.strictEqual(refined.decor, 2900);
  });

  test('Correctly shifts budget when adding fixed dollar amount', () => {
    const instruction = 'add 500 to decor from misc';
    const refined = localRefineBudget(initialBudget, instruction, total);

    const sum = Object.values(refined).reduce((a, b) => a + b, 0);
    assert.strictEqual(sum, total);
    assert.strictEqual(refined.decor, 2500);
    assert.strictEqual(refined.misc, 500);
  });

  test('Correctly handles evenly balancing all categories', () => {
    const instruction = 'evenly balance all categories';
    const refined = localRefineBudget(initialBudget, instruction, total);

    const sum = Object.values(refined).reduce((a, b) => a + b, 0);
    assert.strictEqual(sum, total);
    assert.strictEqual(refined.venue, 2500);
    assert.strictEqual(refined.catering, 2500);
  });

  test('Handles increase target category and offsets difference across others', () => {
    const instruction = 'increase photography to 3000';
    const refined = localRefineBudget(initialBudget, instruction, total);

    const sum = Object.values(refined).reduce((a, b) => a + b, 0);
    assert.strictEqual(sum, total);
    assert.strictEqual(refined.photography, 3000);
  });
});
