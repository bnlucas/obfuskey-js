// src/utils/generateNextPrime.test.ts

import { describe, it, expect } from 'vitest';
import { generateNextPrime } from './generateNextPrime.js';
import ObfuskeyAlphabet from '../ObfuskeyAlphabet.js';
import { FIXED_POINT_SCALE } from '../constants.js'; // Ensure this is correctly imported
import { toFixedPointBigInt } from './toFixedPointBigInt.js'; // Ensure this is correctly imported
import { getNextPrime } from '../math/getNextPrime.js'; // Ensure this is correctly imported
import { TypeError } from '../errors.js'; // Assuming TypeError is correctly imported

describe('generateNextPrime', () => {
  // Use real ObfuskeyAlphabet instances, consistent with other tests
  const hexAlphabet = new ObfuskeyAlphabet('0123456789abcdef'); // Base 16
  const decimalAlphabet = new ObfuskeyAlphabet('0123456789'); // Base 10
  const binaryAlphabet = new ObfuskeyAlphabet('01'); // Base 2

  it('should correctly calculate targetValue and find next prime for keyLength 1 and multiplier 1.0 (Decimal)', () => {
    // For keyLength 1, max value for decimalAlphabet (base 10) is 10^1 - 1 = 9.
    // targetValue = (9n * toFixedPointBigInt(1.0, FIXED_POINT_SCALE)) / FIXED_POINT_SCALE = 9n
    // getNextPrime(9n) should return 11n.
    const result = generateNextPrime(decimalAlphabet, 1n, 1.0);
    expect(result).toBe(11n); // getNextPrime(9n) should be 11n
  });

  it('should correctly calculate targetValue and find next prime for keyLength 2 and multiplier 1.0 (Decimal)', () => {
    // For keyLength 2, max value for decimalAlphabet (base 10) is 10^2 - 1 = 99.
    // targetValue = (99n * toFixedPointBigInt(1.0, FIXED_POINT_SCALE)) / FIXED_POINT_SCALE = 99n
    // getNextPrime(99n) should return 101n.
    const result = generateNextPrime(decimalAlphabet, 2n, 1.0);
    expect(result).toBe(101n); // getNextPrime(99n) should be 101n
  });

  it('should correctly apply a fractional multiplier (Decimal Alphabet)', () => {
    // For decimalAlphabet, keyLength 3: max value is 10^3 - 1 = 999n.
    // Multiplier 1.5.
    // scaledMultiplier = toFixedPointBigInt(1.5, FIXED_POINT_SCALE)
    // scaledTargetValue = 999n * scaledMultiplier
    // targetValue = scaledTargetValue / FIXED_POINT_SCALE = Math.floor(999 * 1.5) = 1498n (due to integer division)
    // getNextPrime(1498n) should be 1499n (1499 is prime)
    // Let's re-verify 1498n's next prime.
    // getNextPrime(1498n) -> 1499n (1499 is indeed prime)
    const result = generateNextPrime(decimalAlphabet, 3n, 1.5);
    expect(result).toBe(1499n);
  });

  it('should correctly apply a multiplier less than 1 (Decimal Alphabet)', () => {
    // For decimalAlphabet, keyLength 2: max value is 10^2 - 1 = 99n.
    // Multiplier 0.5.
    // targetValue = Math.floor(99 * 0.5) = 49n (due to integer division)
    // getNextPrime(49n) should be 53n.
    const result = generateNextPrime(decimalAlphabet, 2n, 0.5);
    expect(result).toBe(53n);
  });

  it('should handle large keyLength values correctly (Hex Alphabet)', () => {
    // For keyLength 16 (hex alphabet, base 16): max value is 16^16 - 1.
    const expectedMaxValue = hexAlphabet.base ** 16n - 1n;
    const expectedTargetValue =
      (toFixedPointBigInt(1.0, FIXED_POINT_SCALE) * expectedMaxValue) /
      FIXED_POINT_SCALE;
    const expectedPrime = getNextPrime(expectedTargetValue);

    const result = generateNextPrime(hexAlphabet, 16n, 1.0);
    expect(result).toBe(expectedPrime);
  });

  it('should return 2n if the calculated targetValue is less than 2n', () => {
    // For binaryAlphabet, keyLength 1: max value is 2^1 - 1 = 1n.
    // If multiplier is very small, e.g., 0.000000000000000001 (1 / FIXED_POINT_SCALE)
    // targetValue will be (1n * 1n) / FIXED_POINT_SCALE = 0n (due to integer division)
    // getNextPrime(0n) should be 2n.
    const result = generateNextPrime(binaryAlphabet, 1n, 0.000000000000000001); // Very small multiplier
    expect(result).toBe(2n);
  });

  // --- Error Handling ---
  it('should throw TypeError if multiplier is not a number', () => {
    // @ts-ignore // Suppress TypeScript errors for intentionally incorrect types
    expect(() => generateNextPrime(hexAlphabet, 5n, 'not a number')).toThrow(
      TypeError
    );
    // @ts-ignore
    expect(() => generateNextPrime(hexAlphabet, 5n, null)).toThrow(TypeError);
    // @ts-ignore
    expect(() => generateNextPrime(hexAlphabet, 5n, undefined)).toThrow(
      TypeError
    );
    // @ts-ignore
    expect(() => generateNextPrime(hexAlphabet, 5n, BigInt(1))).toThrow(
      TypeError
    ); // Multiplier must be `number`
  });

  it('should throw TypeError if keyLength is not a BigInt', () => {
    // @ts-ignore
    expect(() => generateNextPrime(hexAlphabet, 5, 1.0)).toThrow(TypeError); // `5` is number, not BigInt
    // @ts-ignore
    expect(() => generateNextPrime(hexAlphabet, '5', 1.0)).toThrow(TypeError);
    // @ts-ignore
    expect(() => generateNextPrime(hexAlphabet, null, 1.0)).toThrow(TypeError);
  });

  it('should handle large results gracefully (delegated to getNextPrime)', () => {
    // Test a scenario where the targetValue is very large but within acceptable limits
    // for getNextPrime (e.g., less than 2^512).
    // This relies on ObfuskeyAlphabet.getMaxValue's ability to produce large BigInts.
    const veryLargeKeyLength = 100n; // This would result in (base^100 - 1)
    const expectedMaxValue = hexAlphabet.base ** veryLargeKeyLength - 1n; // (16^100 - 1)
    const expectedTargetValue =
      (toFixedPointBigInt(1.0, FIXED_POINT_SCALE) * expectedMaxValue) /
      FIXED_POINT_SCALE;
    const expectedPrime = getNextPrime(expectedTargetValue);

    const result = generateNextPrime(hexAlphabet, veryLargeKeyLength, 1.0);
    expect(result).toBe(expectedPrime);
  });
});
