// src/math/pow.test.ts

import { describe, it, expect } from 'vitest';
import { pow } from './pow.js'; // Adjust the import path as necessary
import { NegativeValueError, TypeError, ValueError } from '../errors.js'; // Assuming your custom error classes are available

describe('pow', () => {
  // --- Basic Exponentiation (without modulus) ---

  it('should calculate base^0 correctly (result 1n for any base, including 0n^0n)', () => {
    expect(pow(2n, 0n)).toBe(1n);
    expect(pow(100n, 0n)).toBe(1n);
    expect(pow(-5n, 0n)).toBe(1n);
    expect(pow(0n, 0n)).toBe(1n); // Standard mathematical convention for 0^0
  });

  it('should calculate base^1 correctly', () => {
    expect(pow(2n, 1n)).toBe(2n);
    expect(pow(100n, 1n)).toBe(100n);
    expect(pow(-5n, 1n)).toBe(-5n);
    expect(pow(0n, 1n)).toBe(0n);
  });

  it('should calculate positive base and positive exponent correctly', () => {
    expect(pow(2n, 3n)).toBe(8n);
    expect(pow(5n, 2n)).toBe(25n);
    expect(pow(10n, 5n)).toBe(100000n);
    expect(pow(7n, 4n)).toBe(2401n);
    expect(pow(1n, 1000n)).toBe(1n);
  });

  it('should calculate negative base and positive exponent correctly', () => {
    expect(pow(-2n, 2n)).toBe(4n); // (-2)^2 = 4
    expect(pow(-2n, 3n)).toBe(-8n); // (-2)^3 = -8
    expect(pow(-3n, 4n)).toBe(81n); // (-3)^4 = 81
    expect(pow(-3n, 5n)).toBe(-243n); // (-3)^5 = -243
  });

  it('should handle large exponents without modulus', () => {
    expect(pow(2n, 60n)).toBe(1152921504606846976n); // 2^60
    expect(pow(3n, 30n)).toBe(205891132094649n); // 3^30
    expect(pow(10n, 20n)).toBe(100000000000000000000n); // 10^20
  });

  // --- Modular Exponentiation (with modulus) ---

  it('should calculate modular exponentiation correctly for positive results', () => {
    expect(pow(2n, 3n, 5n)).toBe(3n); // 8 % 5 = 3
    expect(pow(5n, 2n, 7n)).toBe(4n); // 25 % 7 = 4
    expect(pow(3n, 10n, 11n)).toBe(1n); // Fermat's Little Theorem
    expect(pow(2n, 10n, 1024n)).toBe(0n); // 1024 % 1024 = 0
    expect(pow(17n, 18n, 19n)).toBe(1n); // Fermat's Little Theorem
  });

  it('should ensure modular result is always positive even with negative intermediate values from base', () => {
    // -2^3 mod 5 = -8 mod 5. In mathematics, this should be 2.
    expect(pow(-2n, 3n, 5n)).toBe(2n);
    // -10^3 mod 7 = -1000 mod 7.
    // -1000 = -143 * 7 + 1. So, -1000 mod 7 is 1.
    expect(pow(-10n, 3n, 7n)).toBe(1n);
    // (-3)^4 mod 5 = 81 mod 5 = 1.
    expect(pow(-3n, 4n, 5n)).toBe(1n);
  });

  it('should handle modulus 1n correctly (result always 0n)', () => {
    expect(pow(10n, 5n, 1n)).toBe(0n);
    expect(pow(12345n, 6789n, 1n)).toBe(0n);
    expect(pow(0n, 0n, 1n)).toBe(0n); // Even 0^0 mod 1 is 0
  });

  it('should handle base 0n with modulus', () => {
    expect(pow(0n, 0n, 7n)).toBe(1n); // 0^0 = 1
    expect(pow(0n, 5n, 7n)).toBe(0n); // 0^positive_exponent = 0
  });

  it('should handle base 1n with modulus', () => {
    expect(pow(1n, 100n, 7n)).toBe(1n); // 1^any = 1
    expect(pow(1n, 0n, 7n)).toBe(1n);
  });

  it('should handle large exponents with modulus', () => {
    // Test with Fermat's Little Theorem for a large prime
    expect(pow(2n, 100n, 101n)).toBe(1n); // 2^100 % 101 = 1 (101 is prime)
    // A large composite modulus
    expect(pow(7n, 200n, 201n)).toBe(49n); // Known value: 7^200 % 201 = 49
    // Very large exponent that wraps around Euler's totient or similar
    // For a prime modulus P, a^(P-1) % P = 1. So a^E % P = a^(E % (P-1)) % P
    expect(pow(5n, 10000000000000000000000000000n, 1009n)).toBe(287n); // 1009 is prime. Exponent is huge.
    // 10000000000000000000000000000 % 1008
    // (5^ (exponent % (modulus-1))) % modulus
    // This tests the efficiency of the algorithm, not direct value.
    // WolframAlpha confirms 5^10^28 mod 1009 = 287.
  });

  // --- Error Handling ---

  it('should throw NegativeValueError if exponent is negative', () => {
    expect(() => pow(2n, -1n)).toThrow(NegativeValueError);
    expect(() => pow(10n, -5n)).toThrow(NegativeValueError);
    expect(() => pow(5n, -2n, 7n)).toThrow(NegativeValueError);
    expect(() => pow(-2n, -3n)).toThrow(NegativeValueError);
  });

  it('should throw TypeError if base is not a BigInt', () => {
    // @ts-ignore // Suppress TypeScript errors for intentionally incorrect types
    expect(() => pow(10, 2n)).toThrow(TypeError);
    // @ts-ignore
    expect(() => pow('10n', 2n)).toThrow(TypeError);
    // @ts-ignore
    expect(() => pow(null, 2n)).toThrow(TypeError);
  });

  it('should throw TypeError if exponent is not a BigInt', () => {
    // @ts-ignore
    expect(() => pow(7n, 2)).toThrow(TypeError);
    // @ts-ignore
    expect(() => pow(7n, '3n')).toThrow(TypeError);
    // @ts-ignore
    expect(() => pow(7n, undefined)).toThrow(TypeError);
  });

  it('should throw TypeError if modulus is provided but not a BigInt', () => {
    // @ts-ignore
    expect(() => pow(7n, 5n, 10)).toThrow(TypeError);
    // @ts-ignore
    expect(() => pow(7n, 5n, '10n')).toThrow(TypeError);
    // @ts-ignore
    expect(() => pow(7n, 5n, null)).toThrow(TypeError); // null is not a BigInt
  });

  it('should throw ValueError if modulus is 0n when provided', () => {
    expect(() => pow(7n, 5n, 0n)).toThrow(ValueError);
    expect(() => pow(10n, 0n, 0n)).toThrow(ValueError);
    expect(() => pow(0n, 5n, 0n)).toThrow(ValueError);
  });
});
