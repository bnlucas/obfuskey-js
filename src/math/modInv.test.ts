// src/math/modInv.test.ts

import { describe, it, expect } from 'vitest';
import { modInv } from './modInv.js';
import { NegativeValueError, TypeError, ValueError } from '../errors.js';

describe('modInv', () => {
  // --- Input Validation Tests ---

  it('should throw NegativeValueError if mod is 0n', () => {
    expect(() => modInv(5n, 0n)).toThrow(NegativeValueError);
    expect(() => modInv(5n, 0n)).toThrow('mod must be a positive integer');
  });

  it('should throw NegativeValueError if mod is a negative BigInt', () => {
    expect(() => modInv(5n, -7n)).toThrow(NegativeValueError);
    expect(() => modInv(5n, -1n)).toThrow('mod must be a positive integer');
  });

  it('should throw TypeError if base is not a BigInt', () => {
    // @ts-ignore
    expect(() => modInv(10, 7n)).toThrow(expect.any(TypeError)); // FIX: Use expect.any
    // @ts-ignore
    expect(() => modInv('5n', 13n)).toThrow(expect.any(TypeError)); // FIX: Use expect.any
  });

  it('should throw TypeError if mod is not a BigInt', () => {
    // @ts-ignore
    expect(() => modInv(5n, 7)).toThrow(expect.any(TypeError)); // FIX: Use expect.any
    // @ts-ignore
    expect(() => modInv(11n, '17n')).toThrow(expect.any(TypeError)); // FIX: Use expect.any
  });

  // --- Inverse Existence (Coprime) Tests ---

  it('should throw ValueError if base and mod are not coprime (GCD > 1)', () => {
    // GCD(6, 9) = 3
    expect(() => modInv(6n, 9n)).toThrow(ValueError);
    expect(() => modInv(6n, 9n)).toThrow(
      'No modular inverse for 6 mod 9 because they are not coprime (GCD is 3).'
    );

    // GCD(10, 15) = 5
    expect(() => modInv(10n, 15n)).toThrow(ValueError);
    expect(() => modInv(10n, 15n)).toThrow(
      'No modular inverse for 10 mod 15 because they are not coprime (GCD is 5).'
    );

    // GCD(4n, 8n) = 4n
    expect(() => modInv(4n, 8n)).toThrow(ValueError);
    expect(() => modInv(4n, 8n)).toThrow(
      'No modular inverse for 4 mod 8 because they are not coprime (GCD is 4).'
    );

    // base is 0, GCD(0, mod) = mod (unless mod is 1)
    expect(() => modInv(0n, 5n)).toThrow(ValueError);
    expect(() => modInv(0n, 5n)).toThrow(
      'No modular inverse for 0 mod 5 because they are not coprime (GCD is 5).'
    );
  });

  // --- Correctness of Inverse Tests ---

  it('should return the correct modular inverse for basic cases', () => {
    // Values verified with Python's pow(base, -1, mod) and confirmed mathematically
    expect(modInv(2n, 3n)).toBe(2n); // (2*2)%3 = 1
    expect(modInv(3n, 5n)).toBe(2n); // (3*2)%5 = 1
    expect(modInv(7n, 10n)).toBe(3n); // (7*3)%10 = 1
    expect(modInv(55n, 97n)).toBe(30n); // <-- THIS IS THE CORRECTED LINE. Expected value is 30n.
  });

  it('should return the correct inverse when base is 1n', () => {
    expect(modInv(1n, 5n)).toBe(1n);
    expect(modInv(1n, 100n)).toBe(1n);
  });

  it('should return the correct inverse when base is mod - 1n', () => {
    expect(modInv(4n, 5n)).toBe(4n); // (4*4)%5 = 1
    expect(modInv(99n, 100n)).toBe(99n); // (99*99)%100 = 1
  });

  it('should handle negative base correctly', () => {
    // -2 mod 5 is 3. Inverse of 3 mod 5 is 2. (3*2)%5 = 1.
    expect(modInv(-2n, 5n)).toBe(2n);

    // -7 mod 10 is 3. Inverse of 3 mod 10 is 7. (3*7)%10 = 1.
    expect(modInv(-7n, 10n)).toBe(7n); // Corrected expected value

    // -13 mod 17 is 4. Inverse of 4 mod 17 is 13. (4*13)%17 = 1.
    expect(modInv(-13n, 17n)).toBe(13n); // Corrected expected value
  });

  it('should return the correct inverse for larger BigInts', () => {
    const largePrime = 9007199254740881n;
    const largeBase = 123456789012345n;
    // The value produced by the algorithm (and verified to be correct) is 1887322016520906n
    const expectedLargeInverse = 1887322016520906n; // <-- CHANGE THIS LINE
    expect(modInv(largeBase, largePrime)).toBe(expectedLargeInverse);
    // Verify the inverse directly: (largeBase * expectedLargeInverse) % largePrime === 1n
    expect((largeBase * expectedLargeInverse) % largePrime).toBe(1n);

    const mod2 = 1000000007n;
    const base2 = 987654321n;
    // Verified with a reliable modular inverse calculator
    const expectedInverse2 = 152057246n;
    expect(modInv(base2, mod2)).toBe(expectedInverse2);
    // Verify the inverse directly: (base2 * expectedInverse2) % mod2 === 1n
    expect((base2 * expectedInverse2) % mod2).toBe(1n);
  });
});
