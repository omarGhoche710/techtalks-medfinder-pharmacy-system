// lib/expiry.ts

const NEAR_EXPIRY_THRESHOLD = 30;

/**
 * Returns remaining days until expiration.
 */
export function getDaysUntilExpiry(expiryDate: Date): number {
  const today = new Date();

  const diff = expiryDate.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Returns true if medication is considered near expiry.
 */
export function isNearExpiry(expiryDate: Date): boolean {
  return getDaysUntilExpiry(expiryDate) <= NEAR_EXPIRY_THRESHOLD;
}
