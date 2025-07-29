import { ValueError } from '../errors.js'; // Assuming you have these error classes

/**
 * Factors a BigInt number `n` into `s` and `d` such that `n - 1 = 2^s * d`, where `d` is odd.
 * This is a preliminary step for probabilistic primality tests like Miller-Rabin, which
 * typically require `n > 1`.
 *
 * @param n The BigInt number to factor.
 * @returns A tuple `[s, d]` where `s` is the number of times 2 divides `n - 1`, and `d` is the odd part of `n - 1`.
 * @throws {TypeError} If `n` is not a BigInt.
 * @throws {ValueError} If `n` is less than or equal to 1, as `n - 1` would be 0 or negative, which cannot be factored in the form 2^s * d where d is odd for primality tests.
 */
export function factor(n: bigint): [bigint, bigint] {
  if (typeof n !== 'bigint') {
    throw new TypeError("factor argument 'n' must be a BigInt.");
  }

  if (n <= 1n) {
    throw new ValueError("factor argument 'n' must be greater than 1.");
  }

  let s = 0n;
  let d: bigint = n - 1n;

  while (d % 2n === 0n) {
    s += 1n;
    d = d / 2n;
  }

  return [s, d];
}
