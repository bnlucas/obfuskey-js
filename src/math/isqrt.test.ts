import { describe, it, expect } from 'vitest';
import { isqrt } from './isqrt.js';
import { RangeError, TypeError } from '../errors.js';

describe('isqrt', () => {
  // --- Edge Cases ---

  it('should return 0n for 0n', () => {
    expect(isqrt(0n)).toBe(0n);
  });

  it('should return 1n for 1n', () => {
    expect(isqrt(1n)).toBe(1n);
  });

  // --- Perfect Squares ---

  it('should correctly calculate the square root for small perfect squares', () => {
    expect(isqrt(4n)).toBe(2n);
    expect(isqrt(9n)).toBe(3n);
    expect(isqrt(16n)).toBe(4n);
    expect(isqrt(25n)).toBe(5n);
    expect(isqrt(100n)).toBe(10n);
    expect(isqrt(121n)).toBe(11n);
    expect(isqrt(169n)).toBe(13n);
    expect(isqrt(225n)).toBe(15n);
  });

  it('should correctly calculate the square root for larger perfect squares', () => {
    expect(isqrt(361n)).toBe(19n);
    expect(isqrt(400n)).toBe(20n);
    expect(isqrt(1024n)).toBe(32n);
    expect(isqrt(9801n)).toBe(99n);
    expect(isqrt(10000n)).toBe(100n);
    expect(isqrt(123456789n * 123456789n)).toBe(123456789n); // A large number that fits in JS number
    // A large perfect square that exceeds Number.MAX_SAFE_INTEGER
    const largeNum = 9007199254740991n; // A prime
    expect(isqrt(largeNum * largeNum)).toBe(largeNum);
    // An even larger perfect square
    const veryLargeNum = 123456789012345678901234567890n;
    expect(isqrt(veryLargeNum * veryLargeNum)).toBe(veryLargeNum);
  });

  // --- Non-Perfect Squares (Floor behavior) ---

  it('should return the floor of the square root for small non-perfect squares', () => {
    expect(isqrt(2n)).toBe(1n);
    expect(isqrt(3n)).toBe(1n);
    expect(isqrt(5n)).toBe(2n);
    expect(isqrt(8n)).toBe(2n);
    expect(isqrt(15n)).toBe(3n);
    expect(isqrt(24n)).toBe(4n);
    expect(isqrt(99n)).toBe(9n);
    expect(isqrt(120n)).toBe(10n);
  });

  it('should return the floor of the square root for larger non-perfect squares', () => {
    // Just below a perfect square
    expect(isqrt(1023n)).toBe(31n);
    expect(isqrt(9999n)).toBe(99n);
    expect(isqrt(9007199254740991n - 1n)).toBe(94906265n); // sqrt(2^53 - 2) ~ 9.49e7
    // Just above a perfect square
    expect(isqrt(1025n)).toBe(32n);
    expect(isqrt(10001n)).toBe(100n);
    expect(isqrt(9007199254740991n + 1n)).toBe(94906265n); // sqrt(2^53) ~ 9.49e7
  });

  // --- Large Numbers ---

  it('should handle large numbers efficiently', () => {
    // Test with a number around 2^60 - 1
    const n1 = 2n ** 60n - 1n; // Not a perfect square
    // Expected result for sqrt(2^60 - 1) is 2^30 - 1
    expect(isqrt(n1)).toBe(2n ** 30n - 1n);

    // Test with a number around 2^128 - 1 (very large)
    const n2 = 2n ** 128n - 1n; // Not a perfect square
    // Expected result for sqrt(2^128 - 1) is 2^64 - 1
    expect(isqrt(n2)).toBe(2n ** 64n - 1n);

    // Test with a number near 10^40 (sqrt ~ 10^20)
    const n3 = 10n ** 40n + 12345678901234567890n;
    expect(isqrt(n3)).toBe(10n ** 20n); // Should be 10^20
  });

  // --- Error Handling ---

  it('should throw RangeError if n is a negative BigInt', () => {
    expect(() => isqrt(-1n)).toThrow(RangeError);
    expect(() => isqrt(-100n)).toThrow(RangeError);
    expect(() => isqrt(-(2n ** 100n))).toThrow(RangeError); // Very large negative BigInt
    expect(() => isqrt(-0n)).not.toThrow(RangeError); // -0n is treated as 0n
  });

  it('should throw TypeError if n is not a BigInt', () => {
    // @ts-ignore // Suppress TypeScript errors for intentionally incorrect types
    expect(() => isqrt(10)).toThrow(TypeError);
    // @ts-ignore
    expect(() => isqrt('10n')).toThrow(TypeError);
    // @ts-ignore
    expect(() => isqrt(null)).toThrow(TypeError);
    // @ts-ignore
    expect(() => isqrt(undefined)).toThrow(TypeError);
    // @ts-ignore
    expect(() => isqrt(true)).toThrow(TypeError);
    // @ts-ignore
    expect(() => isqrt({})).toThrow(TypeError);
  });
});
