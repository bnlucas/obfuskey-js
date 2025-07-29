// src/ObfuskeyAlphabet.test.ts

import { describe, it, expect } from 'vitest';
import ObfuskeyAlphabet from './ObfuskeyAlphabet.js'; // Adjust path if necessary
import {
  DuplicateError,
  NegativeValueError,
  UnknownKeyError,
} from './errors.js'; // Assuming these are correctly exported

describe('ObfuskeyAlphabet', () => {
  // --- Constructor Tests ---
  describe('constructor', () => {
    it('should create an instance with a valid alphabet string', () => {
      const alphabet = new ObfuskeyAlphabet('abc');
      expect(alphabet).toBeInstanceOf(ObfuskeyAlphabet);
      expect(alphabet.alphabet).toBe('abc');
      expect(alphabet.base).toBe(3n);
      expect(alphabet.length).toBe(3n);
    });

    it('should handle a single character alphabet', () => {
      const alphabet = new ObfuskeyAlphabet('x');
      expect(alphabet.alphabet).toBe('x');
      expect(alphabet.base).toBe(1n);
    });

    it('should handle a long alphabet string (e.g., Base64-like)', () => {
      const base64Chars =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
      const alphabet = new ObfuskeyAlphabet(base64Chars);
      expect(alphabet.alphabet).toBe(base64Chars);
      expect(alphabet.base).toBe(64n);
    });

    it('should throw DuplicateError if the alphabet contains duplicate characters', () => {
      expect(() => new ObfuskeyAlphabet('abca')).toThrow(DuplicateError);
      expect(() => new ObfuskeyAlphabet('test string')).toThrow(DuplicateError); // 't' and 's' are duplicated
      expect(() => new ObfuskeyAlphabet('aa')).toThrow(DuplicateError);
    });

    it('should allow an empty alphabet (base 0)', () => {
      // While unusual, an empty alphabet is technically valid from a "no duplicates" perspective.
      // Its utility methods might behave differently (e.g., charAt/indexOf will always throw).
      const alphabet = new ObfuskeyAlphabet('');
      expect(alphabet.alphabet).toBe('');
      expect(alphabet.base).toBe(0n);
      expect(alphabet.length).toBe(0n);
    });
  });

  // --- Getter Tests (`alphabet`, `base`, `length`) and `toString()` ---
  describe('getters and toString()', () => {
    const testAlphabet = new ObfuskeyAlphabet('xyz123');

    it('should return the correct alphabet string via the getter', () => {
      expect(testAlphabet.alphabet).toBe('xyz123');
    });

    it('should return the correct base as a BigInt via the getter', () => {
      expect(testAlphabet.base).toBe(6n);
    });

    it('should return the correct length as a BigInt via the getter', () => {
      expect(testAlphabet.length).toBe(6n);
    });

    it('should return the alphabet string when toString() is called', () => {
      expect(testAlphabet.toString()).toBe('xyz123');
    });
  });

  // --- indexOf(char) Tests ---
  describe('indexOf', () => {
    const alphabet = new ObfuskeyAlphabet('0123456789ABCDEF'); // Hex alphabet

    it('should return the correct BigInt index for existing characters', () => {
      expect(alphabet.indexOf('0')).toBe(0n);
      expect(alphabet.indexOf('5')).toBe(5n);
      expect(alphabet.indexOf('A')).toBe(10n);
      expect(alphabet.indexOf('F')).toBe(15n);
    });

    it('should return the correct BigInt index for the first character', () => {
      expect(alphabet.indexOf('0')).toBe(0n);
    });

    it('should return the correct BigInt index for the last character', () => {
      expect(alphabet.indexOf('F')).toBe(15n);
    });

    it('should throw UnknownKeyError if the character is not found in the alphabet', () => {
      expect(() => alphabet.indexOf('G')).toThrow(UnknownKeyError);
      expect(() => alphabet.indexOf('Z')).toThrow(UnknownKeyError);
      expect(() => alphabet.indexOf(' ')).toThrow(UnknownKeyError);
      expect(() => alphabet.indexOf('')).toThrow(UnknownKeyError); // Empty string not found
      expect(() => alphabet.indexOf('AB')).toThrow(UnknownKeyError); // Multi-char string not found
    });

    it('should throw UnknownKeyError if called on an empty alphabet', () => {
      const emptyAlphabet = new ObfuskeyAlphabet('');
      expect(() => emptyAlphabet.indexOf('a')).toThrow(UnknownKeyError);
    });
  });

  // --- charAt(index) Tests ---
  describe('charAt', () => {
    const alphabet = new ObfuskeyAlphabet('0123456789ABCDEF'); // Hex alphabet

    it('should return the correct character for a valid BigInt index', () => {
      expect(alphabet.charAt(0n)).toBe('0');
      expect(alphabet.charAt(5n)).toBe('5');
      expect(alphabet.charAt(10n)).toBe('A');
      expect(alphabet.charAt(15n)).toBe('F');
    });

    it('should return the correct character for the first index (0n)', () => {
      expect(alphabet.charAt(0n)).toBe('0');
    });

    it('should return the correct character for the last valid index (base - 1n)', () => {
      expect(alphabet.charAt(15n)).toBe('F');
    });

    it('should throw RangeError if the index is negative', () => {
      expect(() => alphabet.charAt(-1n)).toThrow(RangeError);
      expect(() => alphabet.charAt(-10n)).toThrow(RangeError);
    });

    it('should throw RangeError if the index is out of bounds (>= base)', () => {
      expect(() => alphabet.charAt(16n)).toThrow(RangeError); // Base is 16
      expect(() => alphabet.charAt(100n)).toThrow(RangeError);
    });

    it('should throw RangeError if called on an empty alphabet', () => {
      const emptyAlphabet = new ObfuskeyAlphabet('');
      expect(() => emptyAlphabet.charAt(0n)).toThrow(RangeError); // 0 is out of bounds for base 0
      expect(() => emptyAlphabet.charAt(1n)).toThrow(RangeError);
    });

    it('should throw TypeError if index is not a BigInt', () => {
      // @ts-ignore // Suppress TS error for intentional bad input
      expect(() => alphabet.charAt(5)).toThrow(TypeError); // number, not bigint
      // @ts-ignore
      expect(() => alphabet.charAt('5')).toThrow(TypeError);
      // @ts-ignore
      expect(() => alphabet.charAt(null)).toThrow(TypeError);
    });
  });

  // --- getMaxValue(keyLength) Tests ---
  describe('getMaxValue', () => {
    const alphabetBase10 = new ObfuskeyAlphabet('0123456789'); // Base 10
    const alphabetBase2 = new ObfuskeyAlphabet('01'); // Base 2

    it('should return 0n for keyLength 0', () => {
      expect(alphabetBase10.getMaxValue(0n)).toBe(0n);
      expect(alphabetBase2.getMaxValue(0n)).toBe(0n);
      expect(alphabetBase10.getMaxValue(0)).toBe(0n); // Test number input
    });

    it('should return (base - 1n) for keyLength 1', () => {
      expect(alphabetBase10.getMaxValue(1n)).toBe(9n); // 10^1 - 1 = 9
      expect(alphabetBase2.getMaxValue(1n)).toBe(1n); // 2^1 - 1 = 1
      expect(alphabetBase10.getMaxValue(1)).toBe(9n); // Test number input
    });

    it('should calculate max value correctly for positive keyLength (BigInt input)', () => {
      expect(alphabetBase10.getMaxValue(2n)).toBe(99n); // 10^2 - 1 = 99
      expect(alphabetBase10.getMaxValue(3n)).toBe(999n); // 10^3 - 1 = 999
      expect(alphabetBase2.getMaxValue(3n)).toBe(7n); // 2^3 - 1 = 7 (000-111)
      expect(alphabetBase2.getMaxValue(10n)).toBe(1023n); // 2^10 - 1 = 1023
    });

    it('should calculate max value correctly for positive keyLength (number input)', () => {
      expect(alphabetBase10.getMaxValue(2)).toBe(99n);
      expect(alphabetBase2.getMaxValue(5)).toBe(31n); // 2^5 - 1 = 31
    });

    it('should handle large keyLength values leading to very large BigInts', () => {
      // 2^64 - 1
      expect(alphabetBase2.getMaxValue(64n)).toBe(18446744073709551615n);
      // 10^20 - 1
      expect(alphabetBase10.getMaxValue(20n)).toBe(99999999999999999999n);
      // Test with a keyLength that would result in a huge BigInt (e.g., 2^256 - 1)
      expect(alphabetBase2.getMaxValue(256n)).toBe(2n ** 256n - 1n);
    });

    it('should throw NegativeValueError if keyLength is negative', () => {
      expect(() => alphabetBase10.getMaxValue(-1n)).toThrow(NegativeValueError);
      expect(() => alphabetBase2.getMaxValue(-5n)).toThrow(NegativeValueError);
      expect(() => alphabetBase10.getMaxValue(-1)).toThrow(NegativeValueError); // Test number input
    });

    it('should handle getMaxValue for a single-character alphabet (base 1)', () => {
      const singleCharAlphabet = new ObfuskeyAlphabet('a'); // Base is 1n
      expect(singleCharAlphabet.getMaxValue(0n)).toBe(0n); // 1^0 - 1 = 0
      expect(singleCharAlphabet.getMaxValue(1n)).toBe(0n); // 1^1 - 1 = 0
      expect(singleCharAlphabet.getMaxValue(100n)).toBe(0n); // 1^100 - 1 = 0
    });

    it('should handle getMaxValue for an empty alphabet (base 0)', () => {
      const emptyAlphabet = new ObfuskeyAlphabet(''); // Base is 0n
      expect(emptyAlphabet.getMaxValue(0n)).toBe(0n); // 0^0 - 1 = 1 - 1 = 0 (mathematically 0^0 is 1)
      // For keyLength > 0, 0^keyLength is 0. So 0 - 1 = -1n
      expect(emptyAlphabet.getMaxValue(1n)).toBe(-1n); // 0^1 - 1 = -1
      expect(emptyAlphabet.getMaxValue(5n)).toBe(-1n); // 0^5 - 1 = -1
    });
  });
});
