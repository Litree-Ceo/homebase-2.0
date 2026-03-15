// In-memory subscription store; replace with a real DB.
export type SubscriptionRecord = {
  key: string; // customer id or email
  status?: string;
  tier?: string;
  priceId?: string;
  stripeCustomerId?: string;
  currentPeriodEnd?: number;
};

const subscriptions = new Map<string, SubscriptionRecord>();

export function upsertSubscription(record: SubscriptionRecord) {
  const existing = subscriptions.get(record.key) || {};
  const merged = { ...existing, ...record };
  subscriptions.set(record.key, merged);
  return merged;
}

export function getSubscription(key: string) {
  return subscriptions.get(key) || null;
}
