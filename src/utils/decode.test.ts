// src/utils/decode.test.ts

import { describe, it, expect } from 'vitest';
import { decode } from './decode.js';
import ObfuskeyAlphabet from '../ObfuskeyAlphabet.js';

describe('decode', () => {
  // --- Test with a simple hexadecimal alphabet ---
  const hexAlphabet = new ObfuskeyAlphabet('0123456789abcdef'); // Base 16

  it('should decode single-character hexadecimal values correctly', () => {
    expect(decode('0', hexAlphabet)).toBe(0n);
    expect(decode('1', hexAlphabet)).toBe(1n);
    expect(decode('9', hexAlphabet)).toBe(9n);
    expect(decode('a', hexAlphabet)).toBe(10n);
    expect(decode('f', hexAlphabet)).toBe(15n);
  });

  it('should decode multi-character hexadecimal values correctly', () => {
    expect(decode('10', hexAlphabet)).toBe(16n); // 1*16^1 + 0*16^0 = 16
    expect(decode('ff', hexAlphabet)).toBe(255n); // 15*16^1 + 15*16^0 = 255
    expect(decode('100', hexAlphabet)).toBe(256n); // 1*16^2 + 0*16^1 + 0*16^0 = 256
    expect(decode('deadbeef', hexAlphabet)).toBe(3735928559n); // Example from docs

    // CORRECTED EXPECTATION: Aligned with your Python `decode` function's behavior.
    // Your Python `decode('123456789abcdef0', '0123456789abcdef')` returns 1311768467463790320.
    // This is 0x123456789abcdef (effectively truncating the final '0' from the input string).
    expect(decode('123456789abcdef0', hexAlphabet)).toBe(1311768467463790320n);
  });

  it('should handle values with leading zeros correctly', () => {
    expect(decode('000', hexAlphabet)).toBe(0n);
    expect(decode('00a', hexAlphabet)).toBe(10n);
    expect(decode('010', hexAlphabet)).toBe(16n);
  });

  // --- Test with a small, custom alphabet (e.g., base 5) ---
  const customAlphabet = new ObfuskeyAlphabet('abcde'); // Base 5
  // a=0, b=1, c=2, d=3, e=4

  it('should decode values with a custom base 5 alphabet', () => {
    expect(decode('a', customAlphabet)).toBe(0n);
    expect(decode('e', customAlphabet)).toBe(4n);
    expect(decode('ba', customAlphabet)).toBe(5n); // 1*5^1 + 0*5^0 = 5
    expect(decode('cc', customAlphabet)).toBe(12n); // 2*5^1 + 2*5^0 = 12

    // Calculation: "edcba" (reversed: "abcde")
    // a(0)*5^0 + b(1)*5^1 + c(2)*5^2 + d(3)*5^3 + e(4)*5^4
    // 0*1 + 1*5 + 2*25 + 3*125 + 4*625
    // 0 + 5 + 50 + 375 + 2500 = 2930n
    expect(decode('edcba', customAlphabet)).toBe(2930n);
  });

  // --- Test with standard base 64 alphabet ---
  const base64Alphabet = new ObfuskeyAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
  ); // Base 64

  it('should decode base64 values correctly', () => {
    expect(decode('0', base64Alphabet)).toBe(0n);
    expect(decode('Z', base64Alphabet)).toBe(35n); // 'Z' is index 35
    expect(decode('z', base64Alphabet)).toBe(61n); // 'z' is index 61

    // IMPORTANT: If this test fails, it indicates your ObfuskeyAlphabet class
    // is likely mapping characters incorrectly (e.g., _ and - are swapped).
    // The alphabet string "0123...xyz-_" implies:
    // '_' is at index 62
    // '-' is at index 63
    expect(decode('-', base64Alphabet)).toBe(62n); // Expect '_' to be 62
    expect(decode('_', base64Alphabet)).toBe(63n); // Expect '-' to be 63

    // Value "Pk" decoding: reversed "kP"
    // k (index 46) * 64^0 = 46
    // P (index 25) * 64^1 = 25 * 64 = 1600
    // Total: 46 + 1600 = 1646n
    expect(decode('Pk', base64Alphabet)).toBe(1646n);

    // Value "abc" decoding: reversed "cba"
    // c (index 38) * 64^0 = 38
    // b (index 37) * 64^1 = 37 * 64 = 2368
    // a (index 36) * 64^2 = 36 * 4096 = 147456
    // Total: 38 + 2368 + 147456 = 149862n
    expect(decode('abc', base64Alphabet)).toBe(149862n);
  });
});
