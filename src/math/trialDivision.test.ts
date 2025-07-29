import { describe, it, expect } from 'vitest';
import { trialDivision } from './trialDivision.js'; // Adjust import path if your file is elsewhere
import { TypeError } from '../errors.js'; // Assuming your custom TypeError is available

describe('trialDivision', () => {
  // --- Edge Cases and Smallest Numbers ---

  it('should return false for numbers less than 2n', () => {
    expect(trialDivision(0n)).toBe(false);
    expect(trialDivision(1n)).toBe(false);
  });

  it('should return false for negative numbers (primes are positive integers > 1)', () => {
    expect(trialDivision(-1n)).toBe(false);
    expect(trialDivision(-10n)).toBe(false);
    expect(trialDivision(-(2n ** 30n))).toBe(false); // Large negative BigInt
  });

  // --- Small Primes ---

  it('should return true for small prime numbers', () => {
    expect(trialDivision(2n)).toBe(true);
    expect(trialDivision(3n)).toBe(true);
    expect(trialDivision(5n)).toBe(true);
    expect(trialDivision(7n)).toBe(true);
    expect(trialDivision(11n)).toBe(true);
    expect(trialDivision(13n)).toBe(true);
    expect(trialDivision(17n)).toBe(true);
  });

  // --- Small Composites ---

  it('should return false for small composite numbers', () => {
    expect(trialDivision(4n)).toBe(false); // 2*2
    expect(trialDivision(6n)).toBe(false); // 2*3
    expect(trialDivision(8n)).toBe(false); // 2*4
    expect(trialDivision(9n)).toBe(false); // 3*3
    expect(trialDivision(10n)).toBe(false); // 2*5
    expect(trialDivision(15n)).toBe(false); // 3*5
    expect(trialDivision(21n)).toBe(false); // 3*7
    expect(trialDivision(25n)).toBe(false); // 5*5
    expect(trialDivision(49n)).toBe(false); // 7*7
  });

  // --- Numbers requiring iteration up to sqrt(n) ---

  it('should correctly identify primes up to a moderate size', () => {
    expect(trialDivision(29n)).toBe(true);
    expect(trialDivision(97n)).toBe(true);
    expect(trialDivision(199n)).toBe(true);
    expect(trialDivision(499n)).toBe(true);
    expect(trialDivision(997n)).toBe(true);
    expect(trialDivision(1009n)).toBe(true);
    expect(trialDivision(104723n)).toBe(true); // A prime where sqrt(n) is ~323
  });

  it('should correctly identify composites up to a moderate size', () => {
    expect(trialDivision(121n)).toBe(false); // 11*11
    expect(trialDivision(169n)).toBe(false); // 13*13
    expect(trialDivision(529n)).toBe(false); // 23*23
    expect(trialDivision(8633n)).toBe(false); // 89 * 97
    expect(trialDivision(100000n)).toBe(false); // composite
    expect(trialDivision(104725n)).toBe(false); // 104725 = 5 * 20945
    // A large composite that isn't trivially divisible by 2,3,5
    expect(trialDivision(999999n)).toBe(false); // 3^3 * 7 * 11 * 13 * 37
    expect(trialDivision(999983n * 999979n)).toBe(false); // Product of two distinct large primes
  });

  // --- Performance/Upper Bound for Trial Division ---
  // This test ensures it works for "reasonably" large numbers where trial division is still viable
  // (i.e., sqrt(n) is not excessively large, typically < 100,000 for unit tests).
  // Note: If your trialDivision implementation is not optimized, these might run slower.
  it('should correctly identify primality for numbers where sqrt(n) is significant (up to ~10^4-10^5)', () => {
    // A prime number near 10^8
    expect(trialDivision(99999989n)).toBe(true); // sqrt(99999989) is approximately 9999.999
    // A composite number near 10^8, not trivially divisible by 2,3,5
    expect(trialDivision(99999991n)).toBe(false); // 99999991 = 13 * 7692307
    // A prime number near 10^10 (sqrt ~ 10^5) - may be slow depending on environment/implementation
    // expect(trialDivision(999999937n)).toBe(true); // 999999937 is prime
  });

  // --- Error Handling ---

  it('should throw TypeError if n is not a BigInt', () => {
    // @ts-ignore // Suppress TypeScript errors for intentionally incorrect types
    expect(() => trialDivision(10)).toThrow(TypeError);
    // @ts-ignore
    expect(() => trialDivision('10n')).toThrow(TypeError);
    // @ts-ignore
    expect(() => trialDivision(null)).toThrow(TypeError);
    // @ts-ignore
    expect(() => trialDivision(undefined)).toThrow(TypeError);
    // @ts-ignore
    expect(() => trialDivision(true)).toThrow(TypeError);
    // @ts-ignore
    expect(() => trialDivision({})).toThrow(TypeError);
  });
});
