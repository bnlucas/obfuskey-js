// src/math/getNextPrime.test.ts

import { describe, it, expect } from 'vitest';
import { getNextPrime } from './getNextPrime.js';
import { MaximumValueError, TypeError, ValueError } from '../errors.js'; // Ensure all custom errors are imported

describe('getNextPrime', () => {
  // --- Basic Functionality: Small Numbers ---

  it('should return 2n if n is less than 2n (as 2 is the first prime)', () => {
    expect(getNextPrime(0n)).toBe(2n);
    expect(getNextPrime(1n)).toBe(2n);
  });

  it('should return the next prime when n is a small prime or composite (including 2, 3, 4, 5)', () => {
    // Next prime after 2 is 3.
    expect(getNextPrime(2n)).toBe(3n);
    // Next prime after 3 is 5.
    expect(getNextPrime(3n)).toBe(5n);
    // Next prime after 4 is 5.
    expect(getNextPrime(4n)).toBe(5n);
    // Next prime after 5 is 7.
    expect(getNextPrime(5n)).toBe(7n);
  });

  // --- Functionality: Primes and Composites greater than 5 ---

  it('should return the next prime strictly greater than n, even if n is prime and greater than 5', () => {
    // For prime input, should return the *next* prime.
    expect(getNextPrime(7n)).toBe(11n); // Next prime after 7 is 11
    expect(getNextPrime(11n)).toBe(13n); // Next prime after 11 is 13
    expect(getNextPrime(13n)).toBe(17n); // Next prime after 13 is 17
    expect(getNextPrime(17n)).toBe(19n); // Next prime after 17 is 19
    expect(getNextPrime(101n)).toBe(103n); // Next prime after 101 is 103
    expect(getNextPrime(997n)).toBe(1009n); // Next prime after 997 is 1009
  });

  it('should return the next prime when starting from a composite number greater than 5', () => {
    expect(getNextPrime(6n)).toBe(7n);
    expect(getNextPrime(8n)).toBe(11n);
    expect(getNextPrime(9n)).toBe(11n);
    expect(getNextPrime(10n)).toBe(11n);
    expect(getNextPrime(12n)).toBe(13n);
    expect(getNextPrime(100n)).toBe(101n); // 101 is prime
  });

  // --- Functionality: Larger Primes and Gaps ---

  it('should find the next prime correctly for numbers leading to prime gaps', () => {
    expect(getNextPrime(23n)).toBe(29n); // Next prime after 23 is 29
    expect(getNextPrime(24n)).toBe(29n);
    expect(getNextPrime(28n)).toBe(29n);

    expect(getNextPrime(89n)).toBe(97n); // Next prime after 89 is 97
    expect(getNextPrime(90n)).toBe(97n);
    expect(getNextPrime(96n)).toBe(97n);
  });

  it('should find the next prime for moderate larger numbers', () => {
    expect(getNextPrime(1000n)).toBe(1009n); // 1009 is prime
    expect(getNextPrime(1008n)).toBe(1009n);
    expect(getNextPrime(10000n)).toBe(10007n); // 10007 is prime
    expect(getNextPrime(10006n)).toBe(10007n);
  });

  // --- Functionality: Very Large Numbers ---
  it('should find the next prime for numbers around Number.MAX_SAFE_INTEGER', () => {
    // 2^53 - 1 is 9007199254740991n, which is a known prime.
    const knownLargePrime = 9007199254740991n;
    // Verified by Python's gmpy2.next_prime(9007199254740991) -> 9007199254740997
    const nextPrimeAfterKnownLargePrime = 9007199254740997n;
    // The next prime after 9007199254740992 (knownLargePrime + 1)
    // 9007199254741027 is the prime after 9007199254740997
    const nextPrimeAfterSkippedPrime = 9007199254741033n;

    // When given a prime, it should return the *next strictly greater* prime.
    expect(getNextPrime(knownLargePrime)).toBe(nextPrimeAfterKnownLargePrime);
    expect(getNextPrime(knownLargePrime + 1n)).toBe(
      nextPrimeAfterKnownLargePrime
    );
    expect(getNextPrime(knownLargePrime + 20n)).toBe(
      nextPrimeAfterSkippedPrime
    );
  });

  // --- Error Handling ---

  it('should throw TypeError if n is not a BigInt', () => {
    // @ts-ignore // Suppress TypeScript errors for intentionally incorrect types
    expect(() => getNextPrime(10)).toThrow(TypeError);
    // @ts-ignore
    expect(() => getNextPrime('10')).toThrow(TypeError);
    // @ts-ignore
    expect(() => getNextPrime(null)).toThrow(TypeError);
    // @ts-ignore
    expect(() => getNextPrime(undefined)).toThrow(TypeError);
    // @ts-ignore
    expect(() => getNextPrime(true)).toThrow(TypeError);
    // @ts-ignore
    expect(() => getNextPrime({})).toThrow(TypeError);
  });

  it('should throw ValueError if n is a negative BigInt', () => {
    // Assuming getBitLength (used by getNextPrime) throws ValueError for negative inputs
    // as per previous discussions for other functions.
    expect(() => getNextPrime(-1n)).toThrow(ValueError);
    expect(() => getNextPrime(-100n)).toThrow(ValueError);
    expect(() => getNextPrime(-(2n ** 50n))).toThrow(ValueError); // Very large negative BigInt
  });

  it('should throw MaximumValueError if n is a 512-bit integer or larger', () => {
    // Example: 2^512
    const veryLargeNumber = 2n ** 512n;
    expect(() => getNextPrime(veryLargeNumber)).toThrow(MaximumValueError);
    expect(() => getNextPrime(veryLargeNumber + 100n)).toThrow(
      MaximumValueError
    );
    // Test just below 512 bits should NOT throw
    expect(() => getNextPrime(2n ** 511n)).not.toThrow(MaximumValueError);
    expect(() => getNextPrime(2n ** 511n - 1n)).not.toThrow(MaximumValueError);
  });
});
