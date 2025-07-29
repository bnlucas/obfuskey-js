import { PRIME_MULTIPLIER } from './constants.js';
import {
  KeyLengthError,
  MaximumValueError,
  MultiplierError,
  NegativeValueError,
} from './errors.js';
import { modInv } from './math/index.js';
import ObfuskeyAlphabet from './ObfuskeyAlphabet.js';
import { decode, encode, generateNextPrime } from './utils/index.js';

/**
 * The `Obfuskey` class provides functionality to obfuscate and de-obfuscate
 * BigInt values into short, human-readable, and somewhat-randomized string "keys".
 *
 * It uses a specified alphabet for base conversion and an optional or generated
 * prime multiplier for modular arithmetic to achieve obfuscation. All core
 * arithmetic operations are performed using `BigInt` for arbitrary precision.
 */
export default class Obfuskey {
  /**
   * The ObfuskeyAlphabet instance used for base conversion (encoding/decoding characters).
   * @private
   */
  private __alphabet: ObfuskeyAlphabet;

  /**
   * The fixed length of the generated obfuscated keys (in characters).
   * @private
   */
  private __keyLength: number;

  /**
   * The maximum BigInt value that can be represented by a key of `__keyLength`
   * using the `__alphabet`. This value is `(alphabet.base ^ keyLength) - 1n`.
   * @private
   */
  private __maximumValue: bigint;

  /**
   * The prime multiplier used for obfuscation. It's an odd BigInt.
   * This is either provided during construction or lazily generated.
   * @private
   */
  private __multiplier?: bigint;

  /**
   * The default numerical multiplier factor used when automatically generating
   * the prime multiplier. This is sourced from `constants.js`.
   * @private
   */
  private __primeFactor: number = PRIME_MULTIPLIER;

  /**
   * Initializes a new `Obfuskey` instance.
   *
   * @param alphabet The `ObfuskeyAlphabet` instance to use for base conversion.
   * @param keyLength The desired fixed length of the generated obfuscated keys.
   * @param multiplier An optional BigInt multiplier to use for obfuscation.
   * If provided, it must be an odd integer. If not provided, a suitable prime
   * multiplier will be generated automatically based on `keyLength` and `PRIME_MULTIPLIER`.
   * @throws {MultiplierError} If a `multiplier` is provided and it is an even number.
   */
  constructor(
    alphabet: ObfuskeyAlphabet,
    keyLength: number,
    multiplier?: bigint
  ) {
    if (typeof keyLength !== 'number') {
      throw new TypeError("Obfuskey argument 'keyLength' must be a Number.");
    }

    if (multiplier !== undefined) {
      if (typeof multiplier !== 'bigint') {
        throw new TypeError("Obfuskey argument 'multiplier' must be a BigInt.");
      }

      if (!(multiplier & 1n)) {
        throw new MultiplierError('The multiplier must be an odd integer.');
      }
    }

    this.__alphabet = alphabet;
    this.__keyLength = keyLength;
    this.__maximumValue = alphabet.getMaxValue(BigInt(this.__keyLength));
    this.__multiplier = multiplier;
  }

  /**
   * Gets the `ObfuskeyAlphabet` instance associated with this `Obfuskey` instance.
   * @returns {ObfuskeyAlphabet} The alphabet.
   * @readonly
   */
  public get alphabet(): ObfuskeyAlphabet {
    return this.__alphabet;
  }

  /**
   * Gets the fixed length of the generated obfuscated keys.
   * @returns {number} The key length in characters.
   * @readonly
   */
  public get keyLength(): number {
    return this.__keyLength;
  }

  /**
   * Gets the BigInt multiplier used for obfuscation.
   * If the multiplier was not provided during construction, it is generated
   * and cached on the first access. The generated multiplier is a prime number.
   *
   * @returns {bigint} The obfuscation multiplier.
   * @readonly
   */
  public get multiplier(): bigint {
    if (this.__multiplier === undefined) {
      this.__multiplier = this.generatePrimeMultiplier(this.__primeFactor);
    }
    return this.__multiplier;
  }

  /**
   * Gets the maximum BigInt value that can be obfuscated by this `Obfuskey` instance.
   * This is determined by the `alphabet` and `keyLength`.
   * @returns {bigint} The maximum obfuscate-able BigInt value.
   * @readonly
   */
  public get maximumValue(): bigint {
    return this.__maximumValue;
  }

  /**
   * Obfuscates a given BigInt `value` into a fixed-length string key.
   * The value is scaled by the multiplier modulo (`maximumValue + 1n`) and then
   * encoded into the `alphabet`'s base. The resulting string is padded to `keyLength`.
   *
   * @param value The BigInt value to obfuscate. Must be non-negative and
   * less than or equal to `maximumValue`.
   * @returns {string} The obfuscated string key of `__keyLength` characters.
   * @throws {NegativeValueError} If the input `value` is negative.
   * @throws {MaximumValueError} If the input `value` exceeds the `maximumValue`
   * supported by this `Obfuskey` instance.
   */
  public getKey(value: bigint): string {
    if (value < 0n) {
      throw new NegativeValueError(
        'The value must be greater than or equal to zero.'
      );
    }

    if (value > this.__maximumValue) {
      throw new MaximumValueError(
        `The maximum value possible is ${this.__maximumValue}`
      );
    }

    if (value === 0n) {
      return this.emptyKey;
    }

    const rawValue = (value * this.multiplier) % (this.__maximumValue + 1n);
    const encodedValue = encode(rawValue, this.__alphabet);

    return encodedValue.padStart(
      Number(this.__keyLength),
      this.__alphabet.charAt(0n)
    );
  }

  /**
   * De-obfuscates an `Obfuskey` string key back into its original BigInt value.
   * This process reverses the obfuscation performed by `getKey`, using the modular inverse
   * of the multiplier.
   *
   * @param key The obfuscated string key to de-obfuscate. It must have the exact `keyLength`.
   * @returns {bigint} The original BigInt value.
   * @throws {KeyLengthError} If the input `key`'s length does not match the expected `keyLength`.
   */
  public getValue(key: string): bigint {
    if (key.length !== this.__keyLength) {
      throw new KeyLengthError(
        `Key length mismatch, expected a ${this.__keyLength}-character key.`
      );
    }

    if (key === this.emptyKey) {
      return 0n;
    }

    const decodedBigIntValue = decode(key, this.__alphabet);
    const maximumValuePlusOne = this.__maximumValue + 1n;

    return (
      (decodedBigIntValue * modInv(this.multiplier, maximumValuePlusOne)) %
      maximumValuePlusOne
    );
  }

  /**
   * Generates the "empty key" string, which is a key of `__keyLength` filled
   * with the alphabet's zero character. This key always represents the obfuscated value `0n`.
   * @returns {string} The empty key string.
   * @private
   */
  private get emptyKey(): string {
    return ''.padStart(Number(this.__keyLength), this.__alphabet.charAt(0n));
  }

  /**
   * Internal helper method to generate a suitable prime multiplier.
   * It uses the `generateNextPrime` utility function, ensuring the multiplier
   * is a prime number appropriate for the key length and multiplier factor.
   *
   * @param multiplier The numerical factor (float) to influence the magnitude
   * of the generated prime.
   * @returns {bigint} A generated prime BigInt multiplier.
   * @private
   */
  private generatePrimeMultiplier(multiplier: number): bigint {
    return generateNextPrime(
      this.__alphabet,
      BigInt(this.__keyLength),
      multiplier
    );
  }
}
