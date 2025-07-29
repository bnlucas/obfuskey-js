// src/utils/encode.test.ts

import { describe, it, expect } from 'vitest';
import { encode } from './encode.js';
import ObfuskeyAlphabet from '../ObfuskeyAlphabet.js';

describe('encode', () => {
  // --- Test with a simple hexadecimal alphabet ---
  const hexAlphabet = new ObfuskeyAlphabet('0123456789abcdef'); // Base 16

  it('should encode 0n correctly', () => {
    expect(encode(0n, hexAlphabet)).toBe('0');
  });

  it('should encode single-digit hexadecimal values correctly', () => {
    expect(encode(1n, hexAlphabet)).toBe('1');
    expect(encode(9n, hexAlphabet)).toBe('9');
    expect(encode(10n, hexAlphabet)).toBe('a');
    expect(encode(15n, hexAlphabet)).toBe('f');
  });

  it('should encode multi-digit hexadecimal values correctly', () => {
    expect(encode(16n, hexAlphabet)).toBe('10'); // 1*16^1 + 0*16^0 = 16
    expect(encode(255n, hexAlphabet)).toBe('ff'); // 15*16^1 + 15*16^0 = 255
    expect(encode(256n, hexAlphabet)).toBe('100'); // 1*16^2 + 0*16^1 + 0*16^0 = 256
    expect(encode(3735928559n, hexAlphabet)).toBe('deadbeef');

    // This expectation aligns with your Python `decode` output and your system's design.
    expect(encode(1311768467463790320n, hexAlphabet)).toBe('123456789abcdef0');
  });

  it('should handle values that might imply leading zeros when decoded (e.g., 0x0A)', () => {
    expect(encode(10n, hexAlphabet)).toBe('a');
  });

  // --- Test with a small, custom alphabet (e.g., base 5) ---
  const customAlphabet = new ObfuskeyAlphabet('abcde'); // Base 5
  // a=0, b=1, c=2, d=3, e=4

  it('should encode values with a custom base 5 alphabet', () => {
    expect(encode(0n, customAlphabet)).toBe('a'); // Assuming 'a' is 0
    expect(encode(4n, customAlphabet)).toBe('e');
    expect(encode(5n, customAlphabet)).toBe('ba'); // 1*5^1 + 0*5^0 = 5
    expect(encode(12n, customAlphabet)).toBe('cc'); // 2*5^1 + 2*5^0 = 12
    expect(encode(2930n, customAlphabet)).toBe('edcba'); // Based on decode's expectation
  });

  // --- Test with standard base 64 alphabet ---
  const base64Alphabet = new ObfuskeyAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
  ); // Base 64

  it('should encode base64 values correctly', () => {
    expect(encode(0n, base64Alphabet)).toBe('0');
    expect(encode(35n, base64Alphabet)).toBe('Z');
    expect(encode(61n, base64Alphabet)).toBe('z');

    // These expectations are based on the alphabet string "0123...xyz-_"
    // If these fail, investigate ObfuskeyAlphabet's internal mapping for '_' and '-'
    expect(encode(62n, base64Alphabet)).toBe('-');
    expect(encode(63n, base64Alphabet)).toBe('_');

    // CORRECTED EXPECTATION: 1000n in Base64 is "Fe"
    expect(encode(1000n, base64Alphabet)).toBe('Fe');

    // This test re-confirms symmetry with decode("Pk") === 1646n
    expect(encode(1646n, base64Alphabet)).toBe('Pk');

    expect(encode(149862n, base64Alphabet)).toBe('abc'); // Based on decode's expectation
  });

  // --- Error Handling ---
  it('should throw an error for negative values', () => {
    expect(() => encode(-1n, hexAlphabet)).toThrow(
      'The value must be greater than or equal to zero.'
    );
    expect(() => encode(-100n, customAlphabet)).toThrow(
      'The value must be greater than or equal to zero.'
    );
  });
});
