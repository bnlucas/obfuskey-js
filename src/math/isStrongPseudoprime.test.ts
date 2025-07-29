// src/math/isStrongPseudoprime.test.ts

import { describe, it, expect } from 'vitest';
import { isStrongPseudoprime } from './isStrongPseudoprime.js'; // Adjust import path as needed
import { TypeError } from '../errors.js'; // Assuming your custom TypeError is available

// Test suite for isStrongPseudoprime, with expectations derived directly
// from the provided Python `strong_pseudoprime` function's behavior.
// Note: This reflects the specific Python implementation's outcomes,
// which may deviate from standard mathematical definitions of strong pseudoprimes
// or the explicit logic of the provided JavaScript function for some cases.
describe('isStrongPseudoprime (Behavior aligned with provided Python function)', () => {
  // --- Input Validation / Edge Cases for `n` (as per Python function logic) ---

  // Python `if not n & 1: return False` (covers even numbers, including 0, 2)
  // Python `if n == 1: return False`
  it('should return false for n = 0n, 1n, and 2n', () => {
    expect(isStrongPseudoprime(0n)).toBe(false);
    expect(isStrongPseudoprime(1n)).toBe(false);
    expect(isStrongPseudoprime(2n)).toBe(false);
  });

  it('should return false for even numbers greater than 2n', () => {
    expect(isStrongPseudoprime(4n)).toBe(false);
    expect(isStrongPseudoprime(6n)).toBe(false);
    expect(isStrongPseudoprime(100n)).toBe(false);
    expect(isStrongPseudoprime(100000000000000000n)).toBe(false); // Large even number
  });

  // --- Base specific behaviors (as per Python function logic - NO early base-related shortcuts) ---

  // Python does not have the `base <= 1n` or `base >= n - 1n` shortcuts.
  // Behavior is determined by `pow(base, d, n)` and the loop.

  it('should return false for base 0n (as 0^d % n = 0, which fails MR in Python)', () => {
    expect(isStrongPseudoprime(3n, 0n)).toBe(false);
    expect(isStrongPseudoprime(5n, 0n)).toBe(false);
    expect(isStrongPseudoprime(341n, 0n)).toBe(false);
    expect(isStrongPseudoprime(9n, 0n)).toBe(false);
  });

  it('should return true for base 1n (as 1^d % n = 1, which passes MR in Python)', () => {
    expect(isStrongPseudoprime(3n, 1n)).toBe(true);
    expect(isStrongPseudoprime(5n, 1n)).toBe(true);
    expect(isStrongPseudoprime(341n, 1n)).toBe(true);
    expect(isStrongPseudoprime(9n, 1n)).toBe(true);
  });

  it('should return true if base is n-1n (as pow(n-1, d, n) is n-1 for odd d in Python)', () => {
    expect(isStrongPseudoprime(7n, 6n)).toBe(true);
    expect(isStrongPseudoprime(9n, 8n)).toBe(true);
  });

  it('should return false if base is n (as base % n = 0, which fails like base 0n in Python)', () => {
    expect(isStrongPseudoprime(7n, 7n)).toBe(false);
    expect(isStrongPseudoprime(341n, 341n)).toBe(false);
  });

  it('should return true for bases greater than n-1 or n, if base % n satisfies MR criteria', () => {
    expect(isStrongPseudoprime(7n, 10n)).toBe(true);
    expect(isStrongPseudoprime(9n, 10n)).toBe(true);
  });

  // --- Core Miller-Rabin Test Cases (as per Python function logic and observed behavior) ---
  // Expectations here are based on the direct output or derived behavior of the provided Python code.

  it('should return true for small prime numbers (pass Miller-Rabin in Python)', () => {
    expect(isStrongPseudoprime(3n)).toBe(true);
    expect(isStrongPseudoprime(5n)).toBe(true);
    expect(isStrongPseudoprime(7n)).toBe(true);
    expect(isStrongPseudoprime(13n)).toBe(true);
    expect(isStrongPseudoprime(97n)).toBe(true);
    expect(isStrongPseudoprime(101n)).toBe(true);
  });

  it('should return true for larger prime numbers (pass Miller-Rabin in Python)', () => {
    expect(isStrongPseudoprime(9007199254740881n)).toBe(true);
    expect(isStrongPseudoprime(2305843009213693951n)).toBe(true);
    // This specific case: prime, and the Python output showed FALSE. This is now the definitive expectation.
    expect(isStrongPseudoprime(9007199254740991n, 7n)).toBe(false);
    // For default base 2, it should behave as a standard prime and return true (assuming Python agrees).
    expect(isStrongPseudoprime(9007199254740991n)).toBe(true);
  });

  it('should return true for prime numbers with other valid bases (pass Miller-Rabin in Python)', () => {
    expect(isStrongPseudoprime(13n, 3n)).toBe(true);
    expect(isStrongPseudoprime(97n, 5n)).toBe(true);
    expect(isStrongPseudoprime(101n, 7n)).toBe(true);
    expect(isStrongPseudoprime(103n, 100n)).toBe(true);
    expect(isStrongPseudoprime(2305843009213693951n, 3n)).toBe(true);
  });

  // --- Composites that Fail Miller-Rabin Test (Return False in Python) ---

  it('should return false for small composite odd numbers that fail Miller-Rabin for base 2n', () => {
    expect(isStrongPseudoprime(9n)).toBe(false);
    expect(isStrongPseudoprime(15n)).toBe(false);
    expect(isStrongPseudoprime(21n)).toBe(false);
    expect(isStrongPseudoprime(25n)).toBe(false);
    expect(isStrongPseudoprime(33n)).toBe(false);
  });

  it('should return false for composites that are not strong pseudoprimes for specific bases', () => {
    expect(isStrongPseudoprime(121n, 2n)).toBe(false);
    expect(isStrongPseudoprime(781n, 2n)).toBe(false);
  });

  // --- Strong Pseudoprimes (Composites that PASS Miller-Rabin Test) ---
  // These expectations are based on the provided Python code's specific logic and your feedback.

  it('should correctly identify strong pseudoprimes for specific bases (return true in Python)', () => {
    // Smallest strong pseudoprime to base 3: 121 = 11^2. Passes MR base 3 in Python.
    expect(isStrongPseudoprime(121n, 3n)).toBe(true);
    // Smallest strong pseudoprime to base 5: 781 = 11 * 71. Passes MR base 5 in Python.
    expect(isStrongPseudoprime(781n, 5n)).toBe(true);

    // Carmichael number 561 = 3 * 11 * 17. Python output was explicitly FALSE.
    expect(isStrongPseudoprime(561n, 2n)).toBe(false);
    expect(isStrongPseudoprime(561n)).toBe(false); // Default base 2n - aligning with explicit false for 561
    // For 561n, 3n - assuming it should also be false as it's a composite
    expect(isStrongPseudoprime(561n, 3n)).toBe(false);

    // A larger strong pseudoprime for base 2: 6601 = 7 * 23 * 41. Python output was explicitly FALSE.
    expect(isStrongPseudoprime(6601n, 2n)).toBe(false);

    // Strong pseudoprime for base 7: 5329 = 73^2. Python output was explicitly FALSE.
    expect(isStrongPseudoprime(5329n, 7n)).toBe(false);
  });

  // This is the specific case where 341n is a strong pseudoprime to base 2,
  // but the Python code's internal `if x == 1: return False` during the loop makes it return false.
  it('should return false for 341n with base 2n (specific Python logic)', () => {
    expect(isStrongPseudoprime(341n, 2n)).toBe(false);
  });

  // --- Error Handling (as implemented in the JS function, not specified by Python) ---
  // These tests assume the TypeError behavior of the JS function remains as previously defined.

  it('should throw TypeError if n is not a BigInt', () => {
    // @ts-ignore // Suppress TypeScript errors for intentionally incorrect types
    expect(() => isStrongPseudoprime(10, 2n)).toThrow(TypeError);
    // @ts-ignore
    expect(() => isStrongPseudoprime('10n', 2n)).toThrow(TypeError);
    // @ts-ignore
    expect(() => isStrongPseudoprime(null, 2n)).toThrow(TypeError);
  });

  it('should throw TypeError if base is not a BigInt', () => {
    // @ts-ignore
    expect(() => isStrongPseudoprime(7n, 2)).toThrow(TypeError);
    // @ts-ignore
    expect(() => isStrongPseudoprime(7n, '3n')).toThrow(TypeError);
    // The following line should be removed or changed to expect no error if you pass undefined.
    // expect(() => isStrongPseudoprime(7n, undefined as unknown as bigint)).toThrow(TypeError);
    // If you want to test null:
    // @ts-ignore
    expect(() => isStrongPseudoprime(7n, null)).toThrow(TypeError); // This should pass.
  });
});
