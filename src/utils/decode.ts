import ObfuskeyAlphabet from '../ObfuskeyAlphabet.js';
import { enumerate } from './enumerate.js';

/**
 * Decodes a base-encoded string `value` back into its original BigInt representation
 * using the provided `ObfuskeyAlphabet`.
 * This function handles variable-length base conversion.
 *
 * @param value The string to decode. Each character in the string must be present
 * in the `alphabet`.
 * @param alphabet The `ObfuskeyAlphabet` instance that defines the character set
 * and base for the encoding.
 * @returns The decoded BigInt value.
 *
 * @example
 * ```typescript
 * const alphabet = new ObfuskeyAlphabet("0123456789abcdef"); // Base 16
 * const decodedValue = decode("deadbeef", alphabet); // decodedValue will be a BigInt
 * console.log(decodedValue.toString(16)); // "deadbeef"
 * ```
 */
export function decode(value: string, alphabet: ObfuskeyAlphabet): bigint {
  if (value.length === 1) {
    return alphabet.indexOf(value);
  }

  const reversedChars: string[] = [...value].reverse();

  return Array.from(enumerate(reversedChars)).reduce(
    (acc: bigint, [i, char]: [number, string]) => {
      return acc + alphabet.indexOf(char) * alphabet.base ** BigInt(i);
    },
    0n
  );
}
