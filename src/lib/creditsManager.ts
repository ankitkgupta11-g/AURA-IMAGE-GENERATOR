import { UserCredits } from '../types';

const CREDITS_STORAGE_KEY = 'aura_creator_credits_v1';
const DEFAULT_DAILY_CREDITS = 50;

/**
 * Retrieves current user credits, resetting if 24h has passed.
 */
export const getUserCredits = (): UserCredits => {
  try {
    const raw = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (raw) {
      const parsed: UserCredits = JSON.parse(raw);
      const last = new Date(parsed.lastRefreshed).getTime();
      const now = Date.now();
      // If more than 24 hours has passed, refresh to full daily quota
      if (now - last > 24 * 60 * 60 * 1000) {
        const refreshed: UserCredits = {
          remaining: DEFAULT_DAILY_CREDITS,
          totalDaily: DEFAULT_DAILY_CREDITS,
          lastRefreshed: new Date().toISOString(),
          tier: 'Creator Free',
        };
        saveUserCredits(refreshed);
        return refreshed;
      }
      return parsed;
    }
  } catch (e) {
    // ignore
  }

  const initial: UserCredits = {
    remaining: DEFAULT_DAILY_CREDITS,
    totalDaily: DEFAULT_DAILY_CREDITS,
    lastRefreshed: new Date().toISOString(),
    tier: 'Creator Free',
  };
  saveUserCredits(initial);
  return initial;
};

export const saveUserCredits = (credits: UserCredits) => {
  try {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits));
    window.dispatchEvent(new CustomEvent('aura:credits_updated', { detail: credits }));
  } catch (e) {
    // ignore
  }
};

export const consumeCredits = (amount = 1): { success: boolean; remaining: number } => {
  const current = getUserCredits();
  if (current.remaining < amount) {
    return { success: false, remaining: current.remaining };
  }
  const updated: UserCredits = {
    ...current,
    remaining: Math.max(0, current.remaining - amount),
  };
  saveUserCredits(updated);
  return { success: true, remaining: updated.remaining };
};

export const refillCredits = (): UserCredits => {
  const refilled: UserCredits = {
    remaining: DEFAULT_DAILY_CREDITS,
    totalDaily: DEFAULT_DAILY_CREDITS,
    lastRefreshed: new Date().toISOString(),
    tier: 'Pro Studio',
  };
  saveUserCredits(refilled);
  return refilled;
};
