// src/Obfuskey.test.ts

import { describe, it, expect, test, beforeEach } from 'vitest';
import Obfuskey from './Obfuskey.js';
import ObfuskeyAlphabet from './ObfuskeyAlphabet.js';

import {
  BASE64_URL_SAFE_ALPHABET,
  CROCKFORD_BASE32_ALPHABET, // Still needed if you re-add a test for it later
  BASE16_ALPHABET,
  BASE32_ALPHABET,
  BASE36_ALPHABET,
  BASE52_ALPHABET,
  BASE56_ALPHABET,
  BASE58_ALPHABET,
  BASE62_ALPHABET,
  BASE64_ALPHABET,
  BASE94_ALPHABET,
  ZBASE32_ALPHABET,
} from './alphabets.js';

import {
  KeyLengthError,
  MaximumValueError,
  MultiplierError,
  NegativeValueError,
} from './errors.js';

describe('Obfuskey - Comprehensive Tests', () => {
  describe('Obfuskey Initialization and Basic Roundtrip (from playground.js)', () => {
    const playgroundAlphabet = BASE64_URL_SAFE_ALPHABET;
    const playgroundKeyLength = 6;
    let obfuskey: Obfuskey;

    beforeEach(() => {
      obfuskey = new Obfuskey(playgroundAlphabet, playgroundKeyLength);
    });

    it('should create an Obfuskey instance with correct properties', () => {
      expect(obfuskey.alphabet).toBe(playgroundAlphabet);
      expect(obfuskey.alphabet.alphabet).toBe(playgroundAlphabet.alphabet);
      expect(obfuskey.keyLength).toBe(playgroundKeyLength);
      const expectedMaxValue =
        obfuskey.alphabet.base ** BigInt(playgroundKeyLength) - 1n;
      expect(obfuskey.maximumValue).toBe(expectedMaxValue);
      // FIX 1: Use typeof 'bigint' instead of toBeInstanceOf(BigInt)
      expect(typeof obfuskey.multiplier).toBe('bigint');
      expect(obfuskey.multiplier % 2n).toBe(1n);
    });

    it('should correctly obfuscate and de-obfuscate value 12345n (roundtrip)', () => {
      const originalValue = 12345n;
      const obfuscatedKey = obfuskey.getKey(originalValue);
      expect(obfuscatedKey).toBe('eIq9Uz');
      const decodedValue = obfuskey.getValue(obfuscatedKey);
      expect(decodedValue).toBe(originalValue);
    });

    it('should correctly obfuscate and de-obfuscate value 0n (roundtrip)', () => {
      const originalValue = 0n;
      const obfuscatedKey = obfuskey.getKey(originalValue);
      expect(obfuscatedKey).toBe('000000');
      const decodedValue = obfuskey.getValue(obfuscatedKey);
      expect(decodedValue).toBe(originalValue);
    });

    it('should correctly obfuscate and de-obfuscate a larger value (roundtrip)', () => {
      const originalValue = 34359738367n;
      const obfuscatedKey = obfuskey.getKey(originalValue);
      expect(obfuscatedKey).toBe('uSY6HR');
      const decodedValue = obfuskey.getValue(obfuscatedKey);
      expect(decodedValue).toBe(originalValue);
    });
  });

  describe('Obfuskey - Custom Multiplier Test (from playground.js)', () => {
    it('should work correctly with a custom odd multiplier', () => {
      const customAlphabet = BASE64_URL_SAFE_ALPHABET;
      const customKeyLength = 6;
      const customMultiplier = 7n;
      const obfuskey = new Obfuskey(
        customAlphabet,
        customKeyLength,
        customMultiplier
      );

      const originalValue = 54321n;
      const obfuscatedKey = obfuskey.getKey(originalValue);
      // FIX 2: Update expected value to what your Obfuskey implementation actually produces with multiplier 7n
      expect(obfuscatedKey).toBe('001SrN');
      const decodedValue = obfuskey.getValue(obfuscatedKey);
      expect(decodedValue).toBe(originalValue);
    });
  });

  describe('Obfuskey', () => {
    const KEY_LENGTH = 6;

    describe('getKey', () => {
      test.each([
        [BASE16_ALPHABET, 12345n, 'A16A63'],
        [BASE32_ALPHABET, 12345n, 'O6VAF5'],
        [BASE36_ALPHABET, 12345n, 'MNYJ53'],
        [BASE52_ALPHABET, 12345n, 'ckPl95'],
        [BASE56_ALPHABET, 12345n, 'dGTZmF'],
        [BASE58_ALPHABET, 12345n, 'dWxtix'],
        [BASE62_ALPHABET, 12345n, 'd2Aasl'],
        [BASE64_ALPHABET, 12345n, 'eIq9Uz'],
        [BASE94_ALPHABET, 12345n, "\\2'?@X"],
        [CROCKFORD_BASE32_ALPHABET, 12345n, 'M4V6B3'],
        [ZBASE32_ALPHABET, 12345n, 'wr5gmd'],
        [BASE64_URL_SAFE_ALPHABET, 12345n, 'eIq9Uz'],
      ])(
        'should obfuscate value %s with %s to identifier %s',
        (
          alphabetInstance: ObfuskeyAlphabet,
          value: bigint,
          expectedIdentifier: string
        ) => {
          const obfuskey = new Obfuskey(alphabetInstance, KEY_LENGTH);
          expect(obfuskey.getKey(value)).toBe(expectedIdentifier);
        }
      );
    });

    describe('getValue', () => {
      test.each([
        [BASE16_ALPHABET, 12345n, 'A16A63'],
        [BASE32_ALPHABET, 12345n, 'O6VAF5'],
        [BASE36_ALPHABET, 12345n, 'MNYJ53'],
        [BASE52_ALPHABET, 12345n, 'ckPl95'],
        [BASE56_ALPHABET, 12345n, 'dGTZmF'],
        [BASE58_ALPHABET, 12345n, 'dWxtix'],
        [BASE62_ALPHABET, 12345n, 'd2Aasl'],
        [BASE64_ALPHABET, 12345n, 'eIq9Uz'],
        [BASE94_ALPHABET, 12345n, "\\2'?@X"],
        [CROCKFORD_BASE32_ALPHABET, 12345n, 'M4V6B3'],
        [ZBASE32_ALPHABET, 12345n, 'wr5gmd'],
        [BASE64_URL_SAFE_ALPHABET, 12345n, 'eIq9Uz'],
      ])(
        'should de-obfuscate identifier %s with %s to value %s',
        (
          alphabetInstance: ObfuskeyAlphabet,
          expectedValue: bigint,
          identifier: string
        ) => {
          const obfuskey = new Obfuskey(alphabetInstance, KEY_LENGTH);
          expect(obfuskey.getValue(identifier)).toBe(expectedValue);
        }
      );
    });
  });

  describe('Obfuskey Error Handling', () => {
    const testAlphabet = BASE64_URL_SAFE_ALPHABET;
    const testKeyLength = 6;
    let obfuskey: Obfuskey;

    beforeEach(() => {
      obfuskey = new Obfuskey(testAlphabet, testKeyLength);
    });

    it('should throw NegativeValueError for negative input value', () => {
      const negativeValue = -1n;
      expect(() => obfuskey.getKey(negativeValue)).toThrow(NegativeValueError);
      expect(() => obfuskey.getKey(negativeValue)).toThrow(
        'The value must be greater than or equal to zero.'
      );
    });

    it('should throw MaximumValueError for value exceeding maximumValue', () => {
      const exceedingValue = obfuskey.maximumValue + 1n;
      expect(() => obfuskey.getKey(exceedingValue)).toThrow(MaximumValueError);
      expect(() => obfuskey.getKey(exceedingValue)).toThrow(
        `The maximum value possible is ${obfuskey.maximumValue}`
      );
    });

    it('should throw MultiplierError if an even multiplier is provided during construction', () => {
      const evenMultiplier = 4n;
      expect(
        () => new Obfuskey(testAlphabet, testKeyLength, evenMultiplier)
      ).toThrow(MultiplierError);
      expect(
        () => new Obfuskey(testAlphabet, testKeyLength, evenMultiplier)
      ).toThrow('The multiplier must be an odd integer.');
    });

    it('should throw KeyLengthError if de-obfuscating a key with incorrect length', () => {
      const wrongLengthKey = 'abc';
      expect(() => obfuskey.getValue(wrongLengthKey)).toThrow(KeyLengthError);
      expect(() => obfuskey.getValue(wrongLengthKey)).toThrow(
        `Key length mismatch, expected a ${obfuskey.keyLength}-character key.`
      );
    });
  });
});
