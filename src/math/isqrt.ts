import { TypeError, RangeError } from '../errors.js';
import { getBitLength } from '../utils/getBitLength.js';

/**
 * Calculates the integer square root of a BigInt number using a binary search or Newton's method.
 *
 * @param n The BigInt number for which to calculate the square root. Must be non-negative.
 * @returns The integer square root of `n` as a BigInt (e.g., `isqrt(9n)` returns `3n`, `isqrt(8n)` returns `2n`).
 * @throws {RangeError} If the input number `n` is negative.
 */
export function isqrt(n: bigint): bigint {
  if (typeof n !== 'bigint') {
    throw new TypeError("isqrt argument 'n' must be a BigInt.");
  }

  if (n < 0n) {
    throw new RangeError('Square root is not defined for negative numbers.');
  }

  if (n < 2n) {
    return n;
  }

  let x0: bigint = 1n << ((getBitLength(n) + 1n) >> 1n);
  let x1: bigint = (x0 + n / x0) >> 1n;

  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + n / x0) >> 1n;
  }

  return x0;
}
