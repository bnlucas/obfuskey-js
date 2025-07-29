import ObfuskeyAlphabet from '../ObfuskeyAlphabet.js';
import { divmod } from '../math/divmod.js';

/**
 * Encodes a BigInt `value` into a base-encoded string representation
 * using the provided `ObfuskeyAlphabet`.
 *
 * @param value The BigInt number to encode. Must be greater than or equal to zero.
 * @param alphabet The `ObfuskeyAlphabet` instance that defines the character set
 * and base for the encoding.
 * @returns The encoded string.
 * @throws {Error} If the `value` is negative.
 *
 * @example
 * ```typescript
 * const alphabet = new ObfuskeyAlphabet("0123456789abcdef"); // Base 16
 * const encodedString = encode(0xdeadbeefn, alphabet); // encodedString will be "deadbeef"
 * console.log(encodedString);
 * ```
 */
export function encode(value: bigint, alphabet: ObfuskeyAlphabet): string {
  if (value < 0n) {
    throw new Error('The value must be greater than or equal to zero.');
  }

  if (value < alphabet.base) {
    return alphabet.charAt(value);
  }

  const key: string[] = [];
  let remainder: bigint;

  while (value > 0n) {
    [value, remainder] = divmod(value, alphabet.base);

    key.push(alphabet.charAt(remainder));
  }

  return key.reverse().join('');
}
