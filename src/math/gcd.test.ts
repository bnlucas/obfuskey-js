import { describe, it, expect } from 'vitest';
import { gcd } from './gcd.js';

describe('gcd', () => {
  // --- Core Functionality: Positive Integers ---

  it('should find the GCD of two coprime positive numbers', () => {
    expect(gcd(7n, 5n)).toBe(1n);
    expect(gcd(13n, 17n)).toBe(1n);
    expect(gcd(2n, 3n)).toBe(1n);
  });

  it('should find the GCD when one number is a multiple of the other', () => {
    expect(gcd(10n, 5n)).toBe(5n);
    expect(gcd(24n, 8n)).toBe(8n);
    expect(gcd(7n, 49n)).toBe(7n);
  });

  it('should find the GCD of two numbers sharing common factors', () => {
    expect(gcd(12n, 18n)).toBe(6n);
    expect(gcd(100n, 75n)).toBe(25n);
    expect(gcd(42n, 28n)).toBe(14n);
  });

  it('should find the GCD for larger numbers', () => {
    // GCD(1071, 462) = 21
    expect(gcd(1071n, 462n)).toBe(21n);
    // GCD(987654321n, 123456789n)
    // 987654321 = 9 * 109739369
    // 123456789 = 9 * 13717421
    expect(gcd(987654321n, 123456789n)).toBe(9n);
    // Numbers from a common prime factorization example
    expect(gcd(2n ** 5n * 3n ** 2n * 5n, 2n ** 3n * 3n * 5n ** 2n)).toBe(
      2n ** 3n * 3n * 5n
    ); // 8 * 3 * 5 = 120
  });

  // --- Edge Cases: Zero Input ---

  it('should return the absolute value of the non-zero number when one input is zero', () => {
    expect(gcd(0n, 5n)).toBe(5n);
    expect(gcd(5n, 0n)).toBe(5n);
    expect(gcd(0n, -8n)).toBe(8n);
    expect(gcd(-8n, 0n)).toBe(8n);
  });

  it('should return 0 when both inputs are zero (common convention for Euclidean algorithm)', () => {
    expect(gcd(0n, 0n)).toBe(0n);
  });

  // --- Negative Integers ---
  // GCD is typically defined as the largest *positive* integer.
  it('should return a positive GCD when one input is negative', () => {
    expect(gcd(-10n, 5n)).toBe(5n);
    expect(gcd(10n, -5n)).toBe(5n);
    expect(gcd(-12n, 18n)).toBe(6n);
    expect(gcd(42n, -28n)).toBe(14n);
  });

  it('should return a positive GCD when both inputs are negative', () => {
    expect(gcd(-10n, -5n)).toBe(5n);
    expect(gcd(-12n, -18n)).toBe(6n);
    expect(gcd(-100n, -75n)).toBe(25n);
  });

  // --- Identity Property ---

  it('should return the absolute value of the number when inputs are identical', () => {
    expect(gcd(7n, 7n)).toBe(7n);
    expect(gcd(-7n, -7n)).toBe(7n);
    expect(gcd(100n, 100n)).toBe(100n);
    expect(gcd(-100n, -100n)).toBe(100n);
  });

  // --- Error Handling ---

  it('should throw TypeError if the first argument is not a BigInt', () => {
    // @ts-ignore for testing invalid types
    expect(() => gcd(10, 5n)).toThrow(TypeError);
    // @ts-ignore
    expect(() => gcd('10n', 5n)).toThrow(TypeError);
    // @ts-ignore
    expect(() => gcd(null, 5n)).toThrow(TypeError);
  });

  it('should throw TypeError if the second argument is not a BigInt', () => {
    // @ts-ignore
    expect(() => gcd(10n, 5)).toThrow(TypeError);
    // @ts-ignore
    expect(() => gcd(10n, '5n')).toThrow(TypeError);
    // @ts-ignore
    expect(() => gcd(10n, undefined)).toThrow(TypeError);
  });

  it('should throw TypeError if both arguments are not BigInts', () => {
    // @ts-ignore
    expect(() => gcd(10, 5)).toThrow(TypeError);
    // @ts-ignore
    expect(() => gcd('10n', '5n')).toThrow(TypeError);
  });
});
