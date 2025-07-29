import { NegativeValueError, TypeError, ValueError } from '../errors.js';

/**
 * Calculates the result of `base` raised to the power of `exponent`, optionally modulo a `modulus`.
 * Implements modular exponentiation if a modulus is provided, using the exponentiation by squaring algorithm.
 *
 * @param base The base BigInt number.
 * @param exponent The exponent BigInt number. Must be non-negative.
 * @param modulus An optional BigInt modulus. If provided, the result will be `(base^exponent) % modulus`.
 * @returns The result of the exponentiation as a BigInt.
 * @throws {NegativeValueError} If the exponent is negative.
 * @throws {TypeError} If base, exponent, or modulus (if provided) are not BigInts.
 * @throws {ValueError} If modulus is 0n.
 */
export function pow(base: bigint, exponent: bigint, modulus?: bigint): bigint {
  // --- Type Validation ---
  if (typeof base !== 'bigint') {
    throw new TypeError("pow argument 'base' must be a BigInt.");
  }

  if (typeof exponent !== 'bigint') {
    throw new TypeError("pow argument 'exponent' must be a BigInt.");
  }

  if (modulus !== undefined && typeof modulus !== 'bigint') {
    throw new TypeError(
      "pow argument 'modulus' must be a BigInt or undefined."
    );
  }

  // --- Exponent Sign Validation ---
  if (exponent < 0n) {
    throw new NegativeValueError(
      'Negative exponents are not supported for general exponentiation.'
    );
  }

  // --- Modulus 0n Validation ---
  if (modulus !== undefined && modulus === 0n) {
    throw new ValueError('Modulus cannot be zero.');
  }

  // --- Base Cases ---
  if (exponent === 0n) {
    // x^0 = 1. If modulus is 1, 1 % 1 = 0.
    return modulus !== undefined && modulus === 1n ? 0n : 1n;
  }

  // If base is 0, and exponent > 0, result is 0.
  // This must come AFTER exponent === 0n check, because 0^0 is 1.
  if (base === 0n) {
    return 0n;
  }

  // Handle modulus 1n for non-zero base and non-zero exponent
  if (modulus !== undefined && modulus === 1n) {
    return 0n;
  }

  // --- Exponentiation by Squaring Algorithm ---
  let result = 1n;
  let currentBase = base; // Use a mutable variable for the base being squared
  let currentExponent = exponent; // Use a mutable variable for the exponent

  // Normalize currentBase if modulus is provided (ensures base is in [0, modulus-1])
  // This handles negative bases correctly for modular arithmetic.
  if (modulus !== undefined) {
    currentBase = ((currentBase % modulus) + modulus) % modulus;
  }

  while (currentExponent > 0n) {
    // If the current bit of the exponent is 1 (i.e., exponent is odd)
    if (currentExponent % 2n === 1n) {
      if (modulus !== undefined) {
        result = (result * currentBase) % modulus;
      } else {
        result = result * currentBase;
      }
    }

    // Square the base for the next iteration (currentBase = base_i^2)
    // and halve the exponent (currentExponent = floor(exponent_i / 2))
    // This order is crucial.
    if (modulus !== undefined) {
      currentBase = (currentBase * currentBase) % modulus;
    } else {
      currentBase = currentBase * currentBase;
    }
    currentExponent /= 2n;
  }

  // Final adjustment for modular result to ensure it's positive,
  // in case `(X % M)` yielded a negative number from JS `%` operator for negative `X`.
  // This is typically handled by `((X % M) + M) % M` during calculation,
  // but a final check is robust.
  if (modulus !== undefined) {
    return (result + modulus) % modulus;
  } else {
    return result;
  }
}
