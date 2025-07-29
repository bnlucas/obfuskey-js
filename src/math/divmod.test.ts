import { describe, it, expect } from 'vitest';
import { divmod } from './divmod.js';

describe('divmod', () => {
  // --- Basic Functionality (Positive Numbers) ---
  it('should correctly perform integer division and calculate remainder for positive numbers', () => {
    expect(divmod(10n, 3n)).toEqual([3n, 1n]);
    expect(divmod(7n, 2n)).toEqual([3n, 1n]);
    expect(divmod(15n, 4n)).toEqual([3n, 3n]);
  });

  it('should return 0 remainder for exact division with positive numbers', () => {
    expect(divmod(10n, 2n)).toEqual([5n, 0n]);
    expect(divmod(12n, 3n)).toEqual([4n, 0n]);
  });

  it('should handle dividend smaller than divisor for positive numbers', () => {
    expect(divmod(3n, 10n)).toEqual([0n, 3n]);
    expect(divmod(1n, 5n)).toEqual([0n, 1n]);
  });

  // --- Basic Functionality (Negative Numbers) ---
  // EXPECTATIONS CHANGED TO MIMIC PYTHON'S DIVMOD
  it('should correctly handle negative dividend and positive divisor (Python-like)', () => {
    // Python: divmod(-10, 3) -> (-4, 2)
    expect(divmod(-10n, 3n)).toEqual([-4n, 2n]);
    // Python: divmod(-7, 2) -> (-4, 1)
    expect(divmod(-7n, 2n)).toEqual([-4n, 1n]);
    // Python: divmod(-15, 4) -> (-4, 1)
    expect(divmod(-15n, 4n)).toEqual([-4n, 1n]);
    // Python: divmod(-9, 3) -> (-3, 0)
    expect(divmod(-9n, 3n)).toEqual([-3n, 0n]);
  });

  it('should correctly handle positive dividend and negative divisor (Python-like)', () => {
    // Python: divmod(10, -3) -> (-4, -2)
    expect(divmod(10n, -3n)).toEqual([-4n, -2n]);
    // Python: divmod(7, -2) -> (-4, -1)
    expect(divmod(7n, -2n)).toEqual([-4n, -1n]);
    // Python: divmod(15, -4) -> (-4, -1)
    expect(divmod(15n, -4n)).toEqual([-4n, -1n]); // This was the failing test!
    // Python: divmod(9, -3) -> (-3, 0)
    expect(divmod(9n, -3n)).toEqual([-3n, 0n]);
  });

  it('should correctly handle both negative dividend and negative divisor (Python-like)', () => {
    // Python: divmod(-10, -3) -> (3, -1)
    expect(divmod(-10n, -3n)).toEqual([3n, -1n]);
    // Python: divmod(-7, -2) -> (3, -1)
    expect(divmod(-7n, -2n)).toEqual([3n, -1n]);
    // Python: divmod(-15, -4) -> (3, -3)
    expect(divmod(-15n, -4n)).toEqual([3n, -3n]);
    // Python: divmod(-9, -3) -> (3, 0)
    expect(divmod(-9n, -3n)).toEqual([3n, 0n]);
  });

  // --- Edge Cases ---
  it('should handle division by 1 and -1', () => {
    expect(divmod(5n, 1n)).toEqual([5n, 0n]);
    expect(divmod(-5n, 1n)).toEqual([-5n, 0n]);
    expect(divmod(5n, -1n)).toEqual([-5n, 0n]);
    expect(divmod(-5n, -1n)).toEqual([5n, 0n]);
  });

  it('should handle dividend of zero', () => {
    expect(divmod(0n, 5n)).toEqual([0n, 0n]);
    expect(divmod(0n, -5n)).toEqual([0n, 0n]);
  });

  // --- Error Handling ---
  it('should throw RangeError for division by zero', () => {
    expect(() => divmod(10n, 0n)).toThrow(RangeError);
    expect(() => divmod(1n, 0n)).toThrow('division by zero');
  });

  it('should throw TypeError if the first argument is not a BigInt', () => {
    // @ts-ignore for testing invalid types
    expect(() => divmod(10, 3n)).toThrow(TypeError);
    // @ts-ignore
    expect(() => divmod('10n', 3n)).toThrow(TypeError);
    // @ts-ignore
    expect(() => divmod(null, 3n)).toThrow(TypeError);
  });

  it('should throw TypeError if the second argument is not a BigInt', () => {
    // @ts-ignore
    expect(() => divmod(10n, 3)).toThrow(TypeError);
    // @ts-ignore
    expect(() => divmod(10n, '3n')).toThrow(TypeError);
    // @ts-ignore
    expect(() => divmod(10n, undefined)).toThrow(TypeError);
  });

  it('should throw TypeError if both arguments are not BigInts', () => {
    // @ts-ignore
    expect(() => divmod(10, 3)).toThrow(TypeError);
    // @ts-ignore
    expect(() => divmod('10n', '3n')).toThrow(TypeError);
  });
});
