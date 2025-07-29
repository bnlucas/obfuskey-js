import { TypeError } from '../errors.js';
import { isStrongPseudoprime } from './isStrongPseudoprime.js';

/**
 * Checks if a BigInt number `n` is a strong pseudoprime for a set of small, commonly used bases.
 * This function uses a deterministic set of bases to achieve a high degree of certainty
 * for primality testing within certain ranges (e.g., up to 2^64 or higher depending on bases).
 *
 * @param n The BigInt number to test for primality.
 * @returns `true` if `n` passes the strong pseudoprime test for the predefined bases, `false` otherwise.
 */
export function isSmallStrongPseudoprime(n: bigint): boolean {
  if (typeof n !== 'bigint') {
    throw new TypeError(
      "isSmallStrongPseudoprime argument 'n' must be a BigInt."
    );
  }

  const bases = [2n, 13n, 23n, 1_662_803n];

  return bases.every((base) => isStrongPseudoprime(n, base));
}
