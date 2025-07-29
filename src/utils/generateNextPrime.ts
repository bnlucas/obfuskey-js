import { FIXED_POINT_SCALE } from '../constants.js';
import { TypeError } from '../errors.js';
import ObfuskeyAlphabet from '../ObfuskeyAlphabet.js';
import { toFixedPointBigInt } from './toFixedPointBigInt.js';
import { getNextPrime } from '../math/getNextPrime.js';

/**
 * Generates the next prime number suitable for use as a modulus or multiplier
 * in cryptographic or obfuscation contexts, based on an `ObfuskeyAlphabet`
 * and a desired `keyLength`.
 *
 * This function calculates a target value derived from the alphabet's maximum value
 * for the given key length and a `PRIME_MULTIPLIER` (which can be a float).
 * It uses fixed-point arithmetic to maintain precision during multiplication involving `PRIME_MULTIPLIER`.
 *
 * @param alphabet The `ObfuskeyAlphabet` instance to get the maximum value for a given key length.
 * @param keyLength The desired length of the obfuscated key (in terms of characters). This
 * influences the magnitude of the target prime.
 * @param multiplier A numerical multiplier (float) to scale the target value before
 * finding the next prime. Defaults to `PRIME_MULTIPLIER` from `./constants.js`.
 * @returns The smallest prime BigInt number that is greater than or equal to the calculated target value.
 */
export function generateNextPrime(
  alphabet: ObfuskeyAlphabet,
  keyLength: bigint,
  multiplier: number
): bigint {
  if (typeof keyLength !== 'bigint') {
    throw new TypeError(
      "generateNextPrime argument 'keyLength' must be a BigInt."
    );
  }

  if (typeof multiplier !== 'number') {
    throw new TypeError(
      "generateNextPrime argument 'number' must be a Number."
    );
  }

  const scaledMultiplier = toFixedPointBigInt(multiplier, FIXED_POINT_SCALE);
  const scaledTargetValue = alphabet.getMaxValue(keyLength) * scaledMultiplier;
  const targetValue = scaledTargetValue / FIXED_POINT_SCALE;

  return getNextPrime(targetValue);
}
