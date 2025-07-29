// alphabets.ts
import ObfuskeyAlphabet from './ObfuskeyAlphabet.js';

/**
 * @file This file defines various standard and commonly used character alphabets
 * as pre-instantiated `ObfuskeyAlphabet` objects.
 */

export const BASE16_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '0123456789ABCDEF'
);
export const BASE32_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '234567ABCDEFGHIJKLMNOPQRSTUVWXYZ'
);
export const BASE36_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
);
export const BASE52_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '0123456789BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz'
);
export const BASE56_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
);
export const BASE58_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
);
export const BASE62_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
);
export const BASE64_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/'
);
export const BASE94_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
);
export const CROCKFORD_BASE32_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
);
export const ZBASE32_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  'ybndrfg8ejkmcpqxot1uwisza345h769'
);
export const BASE64_URL_SAFE_ALPHABET: ObfuskeyAlphabet = new ObfuskeyAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
);
