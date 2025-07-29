import { describe, it, expect } from 'vitest';
import { getBitLength } from './getBitLength.js'; // Adjust import path as necessary
import { TypeError, ValueError } from '../errors.js'; // Assuming you have these custom error classes

describe('getBitLength', () => {
  // --- Basic Functionality (Positive Integers) ---

  it('should return 1n for 1 (0b1)', () => {
    expect(getBitLength(1)).toBe(1n);
    expect(getBitLength(1n)).toBe(1n);
  });

  it('should correctly calculate bit length for small powers of 2', () => {
    expect(getBitLength(2)).toBe(2n); // 0b10
    expect(getBitLength(2n)).toBe(2n);
    expect(getBitLength(4)).toBe(3n); // 0b100
    expect(getBitLength(4n)).toBe(3n);
    expect(getBitLength(8)).toBe(4n); // 0b1000
    expect(getBitLength(8n)).toBe(4n);
  });

  it('should correctly calculate bit length for numbers just below powers of 2 (all bits set)', () => {
    expect(getBitLength(3)).toBe(2n); // 0b11
    expect(getBitLength(3n)).toBe(2n);
    expect(getBitLength(7)).toBe(3n); // 0b111
    expect(getBitLength(7n)).toBe(3n);
    expect(getBitLength(15)).toBe(4n); // 0b1111
    expect(getBitLength(15n)).toBe(4n);
  });

  it('should correctly calculate bit length for arbitrary positive numbers (number type)', () => {
    expect(getBitLength(5)).toBe(3n); // 0b101
    expect(getBitLength(10)).toBe(4n); // 0b1010
    expect(getBitLength(100)).toBe(7n); // 0b1100100
    expect(getBitLength(255)).toBe(8n); // 0b11111111
    expect(getBitLength(256)).toBe(9n); // 0b100000000
    expect(getBitLength(1023)).toBe(10n); // 0b1111111111
    expect(getBitLength(1024)).toBe(11n); // 0b10000000000
  });

  it('should correctly calculate bit length for arbitrary positive numbers (bigint type)', () => {
    expect(getBitLength(5n)).toBe(3n);
    expect(getBitLength(10n)).toBe(4n);
    expect(getBitLength(100n)).toBe(7n);
    expect(getBitLength(255n)).toBe(8n);
    expect(getBitLength(256n)).toBe(9n);
    expect(getBitLength(1023n)).toBe(10n);
    expect(getBitLength(1024n)).toBe(11n);
  });

  it('should handle large BigInt numbers accurately', () => {
    // Numbers just below/at common bit lengths for cryptographic purposes
    expect(getBitLength(2n ** 31n - 1n)).toBe(31n);
    expect(getBitLength(2n ** 31n)).toBe(32n);
    expect(getBitLength(2n ** 63n - 1n)).toBe(63n); // Max positive signed 64-bit int
    expect(getBitLength(2n ** 63n)).toBe(64n);
    expect(getBitLength(2n ** 127n - 1n)).toBe(127n); // Max positive signed 128-bit int
    expect(getBitLength(2n ** 127n)).toBe(128n);
    expect(getBitLength(2n ** 255n)).toBe(256n); // Used in some ECC curves
    expect(getBitLength(2n ** 511n)).toBe(512n);
    expect(getBitLength(2n ** 1000n)).toBe(1001n);
  });

  // --- Edge Cases ---

  it('should return 0n for 0 (0b0), regardless of type', () => {
    expect(getBitLength(0)).toBe(0n);
    expect(getBitLength(0n)).toBe(0n);
  });

  it('should correctly handle Number.MAX_SAFE_INTEGER and values just beyond (for number input)', () => {
    // Number.MAX_SAFE_INTEGER is 2^53 - 1
    expect(getBitLength(Number.MAX_SAFE_INTEGER)).toBe(53n);
    // Number.MAX_SAFE_INTEGER + 1 is 2^53, which is the first integer that cannot be precisely represented by a JavaScript number.
    // It's critical that getBitLength either converts to BigInt internally before calculation for these values,
    // or handles the number type up to its limit correctly.
    expect(getBitLength(Number.MAX_SAFE_INTEGER + 1)).toBe(54n);
    // An example where number precision might fail, but BigInt would be accurate
    // (if the input was given as a literal BigInt, it would be exact)
    // If the implementation converts all numbers to BigInt early, this is handled.
  });

  // --- Error Handling ---

  it('should throw ValueError for negative number input', () => {
    expect(() => getBitLength(-1)).toThrow(ValueError);
    expect(() => getBitLength(-100)).toThrow(ValueError);
    expect(() => getBitLength(-Number.MAX_SAFE_INTEGER)).toThrow(ValueError);
  });

  it('should throw ValueError for negative bigint input', () => {
    expect(() => getBitLength(-1n)).toThrow(ValueError);
    expect(() => getBitLength(-100n)).toThrow(ValueError);
    expect(() => getBitLength(-(2n ** 500n))).toThrow(ValueError);
  });

  it('should throw TypeError for non-integer number input (float)', () => {
    expect(() => getBitLength(10.5)).toThrow(TypeError);
    expect(() => getBitLength(Math.PI)).toThrow(TypeError);
    expect(() => getBitLength(-5.1)).toThrow(TypeError);
  });

  it('should throw TypeError for invalid input type (string, null, undefined, boolean, object)', () => {
    // @ts-ignore // Ignore TS error for testing invalid types
    expect(() => getBitLength('10')).toThrow(TypeError);
    // @ts-ignore
    expect(() => getBitLength(true)).toThrow(TypeError);
    // @ts-ignore
    expect(() => getBitLength(null)).toThrow(TypeError);
    // @ts-ignore
    expect(() => getBitLength(undefined)).toThrow(TypeError);
    // @ts-ignore
    expect(() => getBitLength({})).toThrow(TypeError);
    // @ts-ignore
    expect(() => getBitLength([])).toThrow(TypeError);
  });
});
