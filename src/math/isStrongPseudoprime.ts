import { TypeError } from '../errors.js';
import { factor } from './factor.js';
import { pow } from './pow.js';

/**
 * Checks if a BigInt number `n` is a strong pseudoprime for a given `base` using the Miller-Rabin test.
 * This is a single-base probabilistic primality test.
 *
 * @param n The BigInt number to test for primality. Must be an odd number greater than 2.
 * @param base The base BigInt to use for the strong pseudoprime test. Defaults to 2n.
 * @returns `true` if `n` is a strong pseudoprime to the given base, `false` otherwise.
 */
export function isStrongPseudoprime(n: bigint, base: bigint = 2n): boolean {
  if (typeof n !== 'bigint') {
    throw new TypeError("isStrongPseudoprime argument 'n' must be a BigInt.");
  }

  if (typeof base !== 'bigint') {
    throw new TypeError(
      "isStrongPseudoprime argument 'base' must be a BigInt."
    );
  }

  if (!(n & 1n)) {
    return false;
  }

  if (n === 1n) {
    return false;
  }

  const [s, d] = factor(n);
  let x = pow(base, d, n);

  if (x === 1n || x === n - 1n) {
    return true;
  }

  for (let i: bigint = 0n; i < s; i++) {
    x = pow(x, 2n, n);
    if (x === n - 1n) {
      return true;
    }

    if (x === 1n) {
      return false;
    }
  }

  return false;
}
