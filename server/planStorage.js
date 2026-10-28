import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory plan storage with persistence capability.
 * Provides shareable plan ID lookup and save functionality.
 */
class PlanStorage {
  constructor() {
    this.plans = new Map();
  }

  save(planData) {
    const id = planData.id || `plan_${uuidv4().substring(0, 8)}`;
    const planWithMetadata = {
      ...planData,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: planData.createdAt || new Date().toISOString()
    };
    this.plans.set(id, planWithMetadata);
    return planWithMetadata;
  }

  get(id) {
    return this.plans.get(id) || null;
  }

  has(id) {
    return this.plans.has(id);
  }

  delete(id) {
    return this.plans.delete(id);
  }

  getAll() {
    return Array.from(this.plans.values());
  }
}

export const planStorage = new PlanStorage();
