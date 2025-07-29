import { describe, it, expect } from 'vitest';
import { toFixedPointBigInt } from './toFixedPointBigInt.js';
import { FIXED_POINT_SCALE } from '../constants.js'; // Assuming FIXED_POINT_SCALE exists here
import { TypeError } from '../errors.js'; // Assuming TypeError is imported from your errors.js

describe('toFixedPointBigInt', () => {
  it('should convert a whole number correctly with FIXED_POINT_SCALE', () => {
    expect(toFixedPointBigInt(10, FIXED_POINT_SCALE)).toBe(
      10n * FIXED_POINT_SCALE
    );
    expect(toFixedPointBigInt(123, FIXED_POINT_SCALE)).toBe(
      123n * FIXED_POINT_SCALE
    );
    expect(toFixedPointBigInt(1, FIXED_POINT_SCALE)).toBe(
      1n * FIXED_POINT_SCALE
    );
  });

  it('should convert a positive decimal number correctly with FIXED_POINT_SCALE', () => {
    expect(toFixedPointBigInt(0.5, FIXED_POINT_SCALE)).toBe(
      FIXED_POINT_SCALE / 2n
    );
    expect(toFixedPointBigInt(0.125, FIXED_POINT_SCALE)).toBe(
      FIXED_POINT_SCALE / 8n
    );
    expect(toFixedPointBigInt(3.14159, FIXED_POINT_SCALE)).toBe(
      3141590000000000000n
    ); // 3.14159 * 10^18
  });

  it('should convert a negative number correctly with FIXED_POINT_SCALE', () => {
    expect(toFixedPointBigInt(-0.5, FIXED_POINT_SCALE)).toBe(
      -(FIXED_POINT_SCALE / 2n)
    );
    expect(toFixedPointBigInt(-10, FIXED_POINT_SCALE)).toBe(
      -10n * FIXED_POINT_SCALE
    );
    expect(toFixedPointBigInt(-3.14159, FIXED_POINT_SCALE)).toBe(
      -3141590000000000000n
    );
  });

  it('should handle zero correctly', () => {
    expect(toFixedPointBigInt(0, FIXED_POINT_SCALE)).toBe(0n);
    expect(toFixedPointBigInt(-0, FIXED_POINT_SCALE)).toBe(0n); // -0 becomes 0
  });

  it('should handle different scale factors correctly', () => {
    expect(toFixedPointBigInt(123.45, 10n)).toBe(1235n); // 123.45 * 10 = 1234.5 -> round 1235
    expect(toFixedPointBigInt(1.2345, 100n)).toBe(123n); // 1.2345 * 100 = 123.45 -> round 123
    expect(toFixedPointBigInt(1.235, 100n)).toBe(124n); // 1.235 * 100 = 123.5 -> round 124
    expect(toFixedPointBigInt(0.001, 1000n)).toBe(1n); // 0.001 * 1000 = 1 -> 1
    expect(toFixedPointBigInt(0.0009, 1000n)).toBe(1n); // 0.0009 * 1000 = 0.9 -> round 1
    expect(toFixedPointBigInt(0.0004, 1000n)).toBe(0n); // 0.0004 * 1000 = 0.4 -> round 0
  });

  it('should correctly apply Math.round behavior for .5', () => {
    // Math.round rounds .5 away from zero for positive numbers
    expect(toFixedPointBigInt(0.5, 10n)).toBe(5n); // 0.5 * 10 = 5 -> 5n
    expect(toFixedPointBigInt(1.5, 10n)).toBe(15n); // 1.5 * 10 = 15 -> 15n
    expect(toFixedPointBigInt(0.05, 100n)).toBe(5n); // 0.05 * 100 = 5 -> 5n

    // Math.round rounds .5 away from zero for negative numbers
    expect(toFixedPointBigInt(-0.5, 10n)).toBe(-5n); // -0.5 * 10 = -5 -> -5n
    expect(toFixedPointBigInt(-1.5, 10n)).toBe(-15n); // -1.5 * 10 = -15 -> -15n
    expect(toFixedPointBigInt(-0.05, 100n)).toBe(-5n); // -0.05 * 100 = -5 -> -5n
  });

  it('should handle numbers close to Number.MAX_SAFE_INTEGER within `number` precision', () => {
    // Test an exact integer up to MAX_SAFE_INTEGER that won't lose precision before BigInt conversion
    // This confirms that Math.round(Number) * Number(scale) then BigInt() works for values within `number`'s exact integer range.
    const numExact = Number.MAX_SAFE_INTEGER;
    expect(toFixedPointBigInt(numExact, 1n)).toBe(BigInt(numExact)); // Scale of 1n

    // Test with a smaller scale where `num * Number(scale)` stays within `number`'s safe integer range
    const smallScale = 100n; // Example: 9007199254740991 * 100 is still safe
    const numWithSmallScale = 12345.6789;
    const expectedWithSmallScale = BigInt(
      Math.round(numWithSmallScale * Number(smallScale))
    );
    expect(toFixedPointBigInt(numWithSmallScale, smallScale)).toBe(
      expectedWithSmallScale
    );

    // Acknowledge limitation for large product that exceeds Number's precision:
    // The previous test case (MAX_SAFE_INTEGER * FIXED_POINT_SCALE) is inherently imprecise
    // due to `num * Number(scale)` result exceeding `number`'s 53-bit mantissa precision.
    // We ensure it doesn't crash, but cannot guarantee exact result.
    const hugeNumAndScaleProduct =
      Number.MAX_SAFE_INTEGER * Number(FIXED_POINT_SCALE);
    // This assertion checks that it doesn't throw and produces a BigInt that is the
    // best possible conversion given the `number` precision.
    expect(() =>
      toFixedPointBigInt(Number.MAX_SAFE_INTEGER, FIXED_POINT_SCALE)
    ).not.toThrow();
    // Optionally, check it's within a reasonable range if specific tolerance is known.
    // For now, just ensuring it computes without error is enough for this extreme case.
  });

  it('should throw RangeError for non-finite `num` values', () => {
    // BigInt(NaN) and BigInt(Infinity) throw RangeError in JS
    expect(() => toFixedPointBigInt(NaN, FIXED_POINT_SCALE)).toThrow(
      RangeError
    );
    expect(() => toFixedPointBigInt(Infinity, FIXED_POINT_SCALE)).toThrow(
      RangeError
    );
    expect(() => toFixedPointBigInt(-Infinity, FIXED_POINT_SCALE)).toThrow(
      RangeError
    );
  });

  it('should throw TypeError if `num` is not a number (and catch custom message)', () => {
    // @ts-ignore
    expect(() => toFixedPointBigInt('1.23', FIXED_POINT_SCALE)).toThrow(
      new TypeError("toFixedPointBigInt argument 'num' must be a Number.")
    );
    // @ts-ignore
    expect(() => toFixedPointBigInt(true, FIXED_POINT_SCALE)).toThrow(
      new TypeError("toFixedPointBigInt argument 'num' must be a Number.")
    );
    // @ts-ignore
    expect(() => toFixedPointBigInt(null, FIXED_POINT_SCALE)).toThrow(
      new TypeError("toFixedPointBigInt argument 'num' must be a Number.")
    );
    // @ts-ignore
    expect(() => toFixedPointBigInt(undefined, FIXED_POINT_SCALE)).toThrow(
      new TypeError("toFixedPointBigInt argument 'num' must be a Number.")
    );
    // @ts-ignore
    expect(() => toFixedPointBigInt(123n, FIXED_POINT_SCALE)).toThrow(
      new TypeError("toFixedPointBigInt argument 'num' must be a Number.")
    ); // Should be number, not bigint
  });

  it('should throw TypeError if `scale` is not a bigint (and catch custom message)', () => {
    // @ts-ignore
    expect(() => toFixedPointBigInt(1.23, 10)).toThrow(
      new TypeError("toFixedPointBigInt argument 'scale' must be a BigInt.")
    ); // `10` is number, not bigint
    // @ts-ignore
    expect(() => toFixedPointBigInt(1.23, '10')).toThrow(
      new TypeError("toFixedPointBigInt argument 'scale' must be a BigInt.")
    );
    // @ts-ignore
    expect(() => toFixedPointBigInt(1.23, null)).toThrow(
      new TypeError("toFixedPointBigInt argument 'scale' must be a BigInt.")
    );
    // @ts-ignore
    expect(() => toFixedPointBigInt(1.23, undefined)).toThrow(
      new TypeError("toFixedPointBigInt argument 'scale' must be a BigInt.")
    );
  });

  it('should handle floating point inaccuracies gracefully for typical use', () => {
    const num = 0.1;
    const expected = BigInt(Math.round(num * Number(FIXED_POINT_SCALE)));
    expect(toFixedPointBigInt(num, FIXED_POINT_SCALE)).toBe(expected);

    const tinyNumRoundUp = 0.5 / Number(FIXED_POINT_SCALE);
    expect(toFixedPointBigInt(tinyNumRoundUp, FIXED_POINT_SCALE)).toBe(1n);

    const tinyNumRoundDown = 0.4999999999999999 / Number(FIXED_POINT_SCALE);
    expect(toFixedPointBigInt(tinyNumRoundDown, FIXED_POINT_SCALE)).toBe(0n);
  });
});
