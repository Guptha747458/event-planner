/**
 * AuraPlan AI — Device-Only Authentication & Profile Manager
 * All authentication credentials, session tokens, and user plans
 * are stored strictly on the local device (localStorage).
 * No remote database or third-party auth services are contacted.
 */

const STORAGE_KEY_USER = 'auraplan_active_user';
const STORAGE_KEY_ACCOUNTS = 'auraplan_registered_users';
const STORAGE_KEY_PLANS_PREFIX = 'auraplan_user_plans_';

// Default demo account pre-populated on the device for fast evaluation
const DEMO_ACCOUNT = {
  id: 'usr_demo_sophia',
  name: 'Sophia Hayes',
  email: 'sophia@auraplan.ai',
  password: 'password123',
  avatar: '✨',
  role: 'Lead Event Designer',
  createdAt: new Date().toISOString()
};

/**
 * Initialize default demo user on device if no accounts exist
 */
function initDeviceAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      const initial = [DEMO_ACCOUNT];
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to access device accounts:', e);
    return [DEMO_ACCOUNT];
  }
}

/**
 * Get the currently logged-in user on this device
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read current user from device:', e);
    return null;
  }
}

/**
 * Register a new user on this device only
 */
export function registerUser({ name, email, password, avatar = '🎉' }) {
  if (!name || !email || !password) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  try {
    const accounts = initDeviceAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists on this device.' };
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password, // Stored only in local browser storage
      avatar: avatar || '🎉',
      role: 'Event Organizer',
      createdAt: new Date().toISOString()
    };

    accounts.push(newUser);
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));

    // Save as current active session (excluding password)
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(safeUser));

    return { success: true, user: safeUser };
  } catch (e) {
    console.error('Registration failed:', e);
    return { success: false, error: 'Unable to save account to device storage.' };
  }
}

/**
 * Login existing user on this device
 */
export function loginUser(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Please enter your email and password.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const accounts = initDeviceAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);

    if (!account) {
      return { success: false, error: 'No account found on this device with this email.' };
    }

    if (account.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const { password: _, ...safeUser } = account;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  } catch (e) {
    console.error('Login failed:', e);
    return { success: false, error: 'Device storage read error.' };
  }
}

/**
 * Quick 1-click Demo Account login
 */
export function loginDemoUser() {
  initDeviceAccounts();
  const { password: _, ...safeUser } = DEMO_ACCOUNT;
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(safeUser));
  } catch (e) {
    console.error(e);
  }
  return { success: true, user: safeUser };
}

/**
 * Continue as anonymous Guest (Device Guest)
 */
export function loginGuestUser() {
  const guestUser = {
    id: `guest_${Date.now()}`,
    name: 'Guest Planner',
    email: 'guest@device.local',
    avatar: '🎈',
    role: 'Guest Organizer',
    isGuest: true,
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(guestUser));
  } catch (e) {
    console.error(e);
  }
  return { success: true, user: guestUser };
}

/**
 * Log out user from device session
 */
export function logoutUser() {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Save an event plan to the user's on-device history
 */
export function savePlanToUserHistory(userId, plan) {
  if (!userId || !plan || !plan.id) return;
  try {
    const key = `${STORAGE_KEY_PLANS_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    const plans = raw ? JSON.parse(raw) : [];
    const index = plans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      plans[index] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      plans.unshift({ ...plan, savedAt: new Date().toISOString() });
    }
    localStorage.setItem(key, JSON.stringify(plans.slice(0, 20))); // Keep last 20
  } catch (e) {
    console.error('Failed to save plan to user device history:', e);
  }
}

/**
 * Retrieve saved plans for a given user from device storage
 */
export function getUserPlansFromHistory(userId) {
  if (!userId) return [];
  try {
    const key = `${STORAGE_KEY_PLANS_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to get user plans from device:', e);
    return [];
  }
}
