import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage in Node environment
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = storageMock;

const {
  registerUser,
  loginUser,
  loginDemoUser,
  loginGuestUser,
  getCurrentUser,
  logoutUser,
  savePlanToUserHistory,
  getUserPlansFromHistory
} = await import('../src/utils/localAuth.js');

describe('On-Device Authentication Engine (Unit Test)', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  it('Registers a new user strictly to local device storage', () => {
    const res = registerUser({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'mypassword123',
      avatar: '🎉'
    });

    assert.equal(res.success, true);
    assert.equal(res.user.name, 'Alex Rivera');
    assert.equal(res.user.email, 'alex@example.com');
    assert.equal(res.user.avatar, '🎉');
    assert.equal(res.user.password, undefined); // Never exposes password in session
  });

  it('Rejects registration with duplicate email on this device', () => {
    registerUser({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'mypassword123'
    });

    const duplicate = registerUser({
      name: 'Another Alex',
      email: 'alex@example.com',
      password: 'newpassword456'
    });

    assert.equal(duplicate.success, false);
    assert.match(duplicate.error, /already exists on this device/i);
  });

  it('Logs in existing user with matching credentials', () => {
    registerUser({
      name: 'Maya Lin',
      email: 'maya@example.com',
      password: 'secretpassword'
    });

    const loginRes = loginUser('maya@example.com', 'secretpassword');
    assert.equal(loginRes.success, true);
    assert.equal(loginRes.user.name, 'Maya Lin');
  });

  it('Rejects login with invalid password', () => {
    registerUser({
      name: 'Maya Lin',
      email: 'maya@example.com',
      password: 'secretpassword'
    });

    const loginRes = loginUser('maya@example.com', 'wrongpassword');
    assert.equal(loginRes.success, false);
    assert.match(loginRes.error, /incorrect password/i);
  });

  it('Provides 1-click Demo Account login', () => {
    const res = loginDemoUser();
    assert.equal(res.success, true);
    assert.equal(res.user.name, 'Sophia Hayes');
    assert.equal(getCurrentUser().name, 'Sophia Hayes');
  });

  it('Allows Guest login and clears session on logout', () => {
    const guestRes = loginGuestUser();
    assert.equal(guestRes.success, true);
    assert.equal(guestRes.user.isGuest, true);

    logoutUser();
    assert.equal(getCurrentUser(), null);
  });

  it('Saves and retrieves event plans from device-only history', () => {
    const userId = 'usr_test_123';
    const samplePlan = { id: 'plan_abc', metadata: { eventType: 'Wedding' } };

    savePlanToUserHistory(userId, samplePlan);
    const plans = getUserPlansFromHistory(userId);
    assert.equal(plans.length, 1);
    assert.equal(plans[0].id, 'plan_abc');
  });
});

