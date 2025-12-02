/**
 * Promise timeout utility
 * Wraps a promise with a timeout that rejects if not resolved in time
 */

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
export function createTimeout(ms: number, errorMessage?: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage || `Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param ms Timeout in milliseconds
 * @param errorMessage Optional custom error message
 * @returns The resolved promise or timeout error
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([promise, createTimeout(ms, errorMessage)]);
}

