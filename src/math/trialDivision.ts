import { TypeError } from '../errors.js';
import { isqrt } from './isqrt.js';

/**
 * Performs trial division to check if a BigInt number `n` is prime.
 * This method is efficient for relatively small numbers, as its complexity grows with the square root of `n`.
 * It checks for divisibility by 2 and then by odd numbers up to the integer square root of `n`.
 *
 * @param n The BigInt number to check for primality.
 * @returns `true` if `n` is prime, `false` otherwise.
 */
export function trialDivision(n: bigint): boolean {
  if (typeof n !== 'bigint') {
    throw new TypeError("trialDivision argument 'n' must be a BigInt.");
  }

  if (n <= 1n) {
    return false;
  }

  if (n === 2n || n === 3n) {
    return true;
  }

  if (n % 2n === 0n) {
    return false;
  }

  const limit = isqrt(n);

  for (let i: bigint = 3n; i <= limit; i += 2n) {
    if (n % i === 0n) {
      return false;
    }
  }

  return true;
}
