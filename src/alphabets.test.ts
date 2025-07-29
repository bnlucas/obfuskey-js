import { describe, it, expect } from 'vitest';
import {
  BASE16_ALPHABET,
  BASE32_ALPHABET,
  BASE36_ALPHABET,
  BASE52_ALPHABET,
  BASE56_ALPHABET,
  BASE58_ALPHABET,
  BASE62_ALPHABET,
  BASE64_ALPHABET,
  BASE94_ALPHABET,
  CROCKFORD_BASE32_ALPHABET,
  ZBASE32_ALPHABET,
  BASE64_URL_SAFE_ALPHABET,
} from './alphabets.js'; // Adjust path if necessary

describe('Alphabets', () => {
  // Test BASE16_ALPHABET
  it('BASE16_ALPHABET should have correct characters and properties', () => {
    expect(BASE16_ALPHABET.alphabet).toBe('0123456789ABCDEF'); // Changed from .chars to .alphabet
    expect(BASE16_ALPHABET.length).toBe(16n); // Ensure BigInt comparison
    expect(BASE16_ALPHABET.base).toBe(16n); // Changed from ._base to .base
  });

  // Test BASE32_ALPHABET
  it('BASE32_ALPHABET should have correct characters and properties', () => {
    expect(BASE32_ALPHABET.alphabet).toBe('234567ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect(BASE32_ALPHABET.length).toBe(32n);
    expect(BASE32_ALPHABET.base).toBe(32n);
  });

  // Test BASE36_ALPHABET
  it('BASE36_ALPHABET should have correct characters and properties', () => {
    expect(BASE36_ALPHABET.alphabet).toBe(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    );
    expect(BASE36_ALPHABET.length).toBe(36n);
    expect(BASE36_ALPHABET.base).toBe(36n);
  });

  // Test BASE52_ALPHABET
  it('BASE52_ALPHABET should have correct characters and properties', () => {
    expect(BASE52_ALPHABET.alphabet).toBe(
      '0123456789BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz'
    );
    expect(BASE52_ALPHABET.length).toBe(52n);
    expect(BASE52_ALPHABET.base).toBe(52n);
  });

  // Test BASE56_ALPHABET
  it('BASE56_ALPHABET should have correct characters and properties', () => {
    expect(BASE56_ALPHABET.alphabet).toBe(
      '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
    );
    expect(BASE56_ALPHABET.length).toBe(56n);
    expect(BASE56_ALPHABET.base).toBe(56n);
  });

  // Test BASE58_ALPHABET
  it('BASE58_ALPHABET should have correct characters and properties', () => {
    expect(BASE58_ALPHABET.alphabet).toBe(
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    );
    expect(BASE58_ALPHABET.length).toBe(58n);
    expect(BASE58_ALPHABET.base).toBe(58n);
  });

  // Test BASE62_ALPHABET
  it('BASE62_ALPHABET should have correct characters and properties', () => {
    expect(BASE62_ALPHABET.alphabet).toBe(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    );
    expect(BASE62_ALPHABET.length).toBe(62n);
    expect(BASE62_ALPHABET.base).toBe(62n);
  });

  // Test BASE64_ALPHABET
  it('BASE64_ALPHABET should have correct characters and properties', () => {
    expect(BASE64_ALPHABET.alphabet).toBe(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/'
    );
    expect(BASE64_ALPHABET.length).toBe(64n);
    expect(BASE64_ALPHABET.base).toBe(64n);
  });

  // Test BASE94_ALPHABET
  it('BASE94_ALPHABET should have correct characters and properties', () => {
    expect(BASE94_ALPHABET.alphabet).toBe(
      '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        '[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
    );
    expect(BASE94_ALPHABET.length).toBe(94n);
    expect(BASE94_ALPHABET.base).toBe(94n);
  });

  // Test CROCKFORD_BASE32_ALPHABET
  it('CROCKFORD_BASE32_ALPHABET should have correct characters and properties', () => {
    expect(CROCKFORD_BASE32_ALPHABET.alphabet).toBe(
      '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
    );
    expect(CROCKFORD_BASE32_ALPHABET.length).toBe(32n);
    expect(CROCKFORD_BASE32_ALPHABET.base).toBe(32n);
  });

  // Test ZBASE32_ALPHABET
  it('ZBASE32_ALPHABET should have correct characters and properties', () => {
    expect(ZBASE32_ALPHABET.alphabet).toBe('ybndrfg8ejkmcpqxot1uwisza345h769');
    expect(ZBASE32_ALPHABET.length).toBe(32n);
    expect(ZBASE32_ALPHABET.base).toBe(32n);
  });

  // Test BASE64_URL_SAFE_ALPHABET
  it('BASE64_URL_SAFE_ALPHABET should have correct characters and properties', () => {
    expect(BASE64_URL_SAFE_ALPHABET.alphabet).toBe(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
    );
    expect(BASE64_URL_SAFE_ALPHABET.length).toBe(64n);
    expect(BASE64_URL_SAFE_ALPHABET.base).toBe(64n);
  });
});
