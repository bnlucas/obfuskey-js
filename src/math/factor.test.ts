import { describe, it, expect } from 'vitest';
import { ValueError } from '../errors.js';
import { factor } from './factor.js';

describe('factor', () => {
  // --- Basic Functionality ---
  it('should correctly factor n-1 when n-1 is odd', () => {
    // n = 6n => n-1 = 5n (odd) => 5 = 2^0 * 5
    expect(factor(6n)).toEqual([0n, 5n]);
    // n = 100n => n-1 = 99n (odd) => 99 = 2^0 * 99
    expect(factor(100n)).toEqual([0n, 99n]);
    // n = 2n => n-1 = 1n (odd) => 1 = 2^0 * 1
    expect(factor(2n)).toEqual([0n, 1n]);
  });

  it('should correctly factor n-1 when n-1 is a power of 2', () => {
    // n = 3n => n-1 = 2n = 2^1 * 1
    expect(factor(3n)).toEqual([1n, 1n]);
    // n = 5n => n-1 = 4n = 2^2 * 1
    expect(factor(5n)).toEqual([2n, 1n]);
    // n = 9n => n-1 = 8n = 2^3 * 1
    expect(factor(9n)).toEqual([3n, 1n]);
    // n = 1025n => n-1 = 1024n = 2^10 * 1
    expect(factor(1025n)).toEqual([10n, 1n]);
  });

  it('should correctly factor n-1 when n-1 is an even number not a power of 2', () => {
    // n = 7n => n-1 = 6n = 2^1 * 3
    expect(factor(7n)).toEqual([1n, 3n]);
    // n = 13n => n-1 = 12n = 2^2 * 3
    expect(factor(13n)).toEqual([2n, 3n]);
    // n = 25n => n-1 = 24n = 2^3 * 3
    expect(factor(25n)).toEqual([3n, 3n]);
    // n = 101n => n-1 = 100n = 2^2 * 25
    expect(factor(101n)).toEqual([2n, 25n]);
  });

  it('should handle large numbers correctly', () => {
    const largeN = 12345678901234567890n; // n-1 is an even number
    const nMinus1 = largeN - 1n; // 12345678901234567889n (odd)
    expect(factor(largeN)).toEqual([0n, nMinus1]);

    const powerOf2N = 2n ** 50n + 1n; // n-1 is 2^50
    expect(factor(powerOf2N)).toEqual([50n, 1n]);

    const mixedN = 2n ** 30n * 7n + 1n; // n-1 is 2^30 * 7
    expect(factor(mixedN)).toEqual([30n, 7n]);
  });

  // --- Error Handling ---
  it('should throw TypeError if n is not a BigInt', () => {
    // @ts-ignore
    expect(() => factor(10)).toThrow(TypeError);
    // @ts-ignore
    expect(() => factor(null)).toThrow(TypeError);
    // @ts-ignore
    expect(() => factor('10n')).toThrow(TypeError);
  });

  it('should throw ValueError if n is 1n', () => {
    expect(() => factor(1n)).toThrow(ValueError);
    expect(() => factor(1n)).toThrow(
      "factor argument 'n' must be greater than 1."
    );
  });

  it('should throw ValueError if n is less than 1n (0n or negative)', () => {
    expect(() => factor(0n)).toThrow(ValueError);
    expect(() => factor(-5n)).toThrow(ValueError);
    expect(() => factor(-100n)).toThrow(ValueError);
  });
});
