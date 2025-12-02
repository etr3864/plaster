/**
 * Time-related utility functions
 */

/**
 * Get current Unix timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Add delay (for human-like response timing)
 * @param min Minimum delay in milliseconds
 * @param max Maximum delay in milliseconds
 */
export function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Add human-like delay before sending response (1.5-3 seconds)
 */
export async function addHumanDelay(): Promise<void> {
  const delay = getRandomDelay(1500, 3000);
  await sleep(delay);
}
