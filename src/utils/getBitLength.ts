// src/math/getBitLength.ts (Recommended combined approach)

import { TypeError, ValueError } from '../errors.js'; // Ensure correct path for your custom errors

/**
 * Calculates the bit length of a number. For a positive integer `n`, the bit length
 * is the number of bits required to represent `n` in binary (i.e., `floor(log2(n)) + 1`).
 * For `n = 0`, it returns `0n`.
 *
 * @param n The number or bigint for which to calculate the bit length.
 * @returns The bit length of the number as a BigInt.
 * @throws {TypeError} If `n` is not a number or bigint, or if it's a non-integer number.
 * @throws {ValueError} If `n` is a negative number or bigint.
 */
export function getBitLength(n: number | bigint): bigint {
  let num: bigint;

  // 1. Input Validation and Conversion
  if (typeof n === 'number') {
    if (!Number.isInteger(n)) {
      throw new TypeError("getBitLength argument 'n' must be an integer.");
    }
    num = BigInt(n); // Convert number to BigInt for consistent processing
  } else if (typeof n === 'bigint') {
    num = n;
  } else {
    throw new TypeError(
      `getBitLength argument 'n' must be a number or bigint, got ${typeof n}.`
    );
  }

  // 2. Value Validation (Non-negativity)
  if (num < 0n) {
    throw new ValueError(
      "getBitLength argument 'n' must be a non-negative number."
    );
  }

  // 3. Core Logic (Your elegant solution)
  if (num === 0n) {
    return 0n;
  }

  return BigInt(num.toString(2).length);
}
