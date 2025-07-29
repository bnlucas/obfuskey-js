import { TypeError } from '../errors.js';
import { gcd } from './gcd.js';
import { isSmallStrongPseudoprime } from './isSmallStrongPseudoprime.js';
import { trialDivision } from './trialDivision.js';

/**
 * Checks if a BigInt number `n` is a prime number.
 * It uses a combination of:
 * - Direct checks for 2 and small composite numbers.
 * - Trial division for relatively small numbers (up to 2 million).
 * - A deterministic set of Miller-Rabin strong pseudoprime tests for larger numbers.
 *
 * This provides a very high probability of correctness for larger numbers,
 * and is exact for smaller numbers within the trial division range.
 *
 * @param n The BigInt number to check for primality.
 * @returns `true` if `n` is prime, `false` otherwise.
 */
export function isPrime(n: bigint): boolean {
  if (typeof n !== 'bigint') {
    throw new TypeError("isPrime argument 'n' must be a BigInt.");
  }

  if (n < 2n) {
    return false;
  }
  if (n === 2n || n === 3n || n === 5n) {
    return true;
  }

  if (n % 2n === 0n || n % 3n === 0n || n % 5n === 0n) {
    return false;
  }

  if (gcd(n, 510_510n) > 1n) {
    return [7n, 11n, 13n, 17n].includes(n);
  }

  if (n < 2_000_000n) {
    return trialDivision(n);
  }

  return isSmallStrongPseudoprime(n);
}
