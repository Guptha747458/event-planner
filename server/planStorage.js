import { v4 as uuidv4 } from 'uuid';

/** Maximum number of plans held in memory before evicting oldest entries */
const MAX_PLANS = 500;

/**
 * In-memory plan storage with a capped size (LRU-style eviction).
 * Provides shareable plan ID lookup and save functionality.
 */
class PlanStorage {
  constructor() {
    /** @type {Map<string, object>} Insertion-order Map acts as an LRU queue */
    this.plans = new Map();
  }

  /**
   * Save or update a plan. If the store exceeds MAX_PLANS, the oldest entry is evicted.
   * @param {object} planData
   * @returns {object} The saved plan with id, createdAt, and updatedAt fields
   */
  save(planData) {
    const id = planData.id || `plan_${uuidv4().substring(0, 8)}`;

    // If updating an existing entry, delete first so it moves to the end (most-recent)
    if (this.plans.has(id)) {
      this.plans.delete(id);
    }

    const planWithMetadata = {
      ...planData,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: planData.createdAt || new Date().toISOString()
    };

    this.plans.set(id, planWithMetadata);

    // Evict the oldest entry when the cap is exceeded
    if (this.plans.size > MAX_PLANS) {
      const oldestKey = this.plans.keys().next().value;
      this.plans.delete(oldestKey);
    }

    return planWithMetadata;
  }

  /**
   * Retrieve a plan by ID.
   * @param {string} id
   * @returns {object|null}
   */
  get(id) {
    return this.plans.get(id) || null;
  }

  /**
   * Check whether a plan ID exists in the store.
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return this.plans.has(id);
  }

  /**
   * Remove a plan from the store.
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    return this.plans.delete(id);
  }

  /**
   * Return all stored plans as an array (oldest first).
   * @returns {object[]}
   */
  getAll() {
    return Array.from(this.plans.values());
  }

  /**
   * Current number of plans in the store.
   * @returns {number}
   */
  get size() {
    return this.plans.size;
  }
}

export const planStorage = new PlanStorage();
