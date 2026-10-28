/**
 * Calculates slot expiry based on cutoff rules:
 * - ROUND_UP_HOUR: Adds durationDays, then if minutes/seconds > 0, rounds up to next full hour (e.g. 15:23 -> 16:00)
 * - MIDNIGHT: Cuts off at midnight (23:59:59) of the target expiry date
 * - EXACT_TIME: Exact millisecond addition
 */
export function calculateSlotExpiry(
  purchasedAt: Date,
  durationDays: number,
  cutoffType: string = 'ROUND_UP_HOUR'
): Date {
  const expiry = new Date(purchasedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

  if (cutoffType === 'MIDNIGHT') {
    expiry.setHours(23, 59, 59, 999);
    return expiry;
  }

  if (cutoffType === 'ROUND_UP_HOUR') {
    if (expiry.getMinutes() > 0 || expiry.getSeconds() > 0 || expiry.getMilliseconds() > 0) {
      expiry.setHours(expiry.getHours() + 1);
      expiry.setMinutes(0, 0, 0);
    }
    return expiry;
  }

  return expiry;
}
