import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../server/index.js';

describe('POST /api/generate-plan Integration Test (Mocking/Fallback)', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start server on an ephemeral port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        server.unref();
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('generates a full structured event plan and returns 200 with ID', async () => {
    const payload = {
      eventType: 'Wedding',
      date: '2026-11-20',
      guestCount: 120,
      totalBudget: 25000,
      city: 'Austin, TX',
      stylePreference: 'Rustic Modern'
    };

    const res = await fetch(`${baseUrl}/api/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Connection': 'close' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 200, 'Should respond with 200 OK');
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.ok(data.plan, 'Should return a plan object');
    assert.ok(data.plan.id, 'Plan should contain a shareable ID');

    // Verify 4 core modules exist
    assert.ok(data.plan.budget, 'Must contain budget module');
    assert.ok(Array.isArray(data.plan.timeline), 'Must contain timeline tasks array');
    assert.ok(Array.isArray(data.plan.vendors), 'Must contain vendors array');
    assert.ok(Array.isArray(data.plan.ideas), 'Must contain ideas array');

    // Verify 6 ideas constraint
    assert.strictEqual(data.plan.ideas.length, 6, 'Must contain exactly 6 ideas');

    // Verify total budget matches
    const budgetSum = Object.values(data.plan.budget).reduce((a, b) => a + b, 0);
    assert.strictEqual(budgetSum, 25000, 'Allocated budget sum must equal total requested budget');

    // Test GET /api/plan/:id to verify shareable persistence
    const getRes = await fetch(`${baseUrl}/api/plan/${data.plan.id}`, {
      headers: { 'Connection': 'close' }
    });
    assert.strictEqual(getRes.status, 200, 'Should retrieve plan by shareable ID');
    const fetched = await getRes.json();
    assert.strictEqual(fetched.plan.id, data.plan.id);
  });
});
