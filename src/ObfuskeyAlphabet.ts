import {
  DuplicateError,
  NegativeValueError,
  UnknownKeyError,
} from './errors.js';

/**
 * The `ObfuskeyAlphabet` class defines the set of characters used for base
 * conversion in `Obfuskey` and `Obfusbit`. It manages the alphabet string
 * and its corresponding numerical base.
 *
 * It ensures that the alphabet contains unique characters and provides utilities
 * to convert between characters and their BigInt indices, as well as to
 * calculate maximum representable values. All base and index calculations
 * involving the alphabet are handled using `BigInt` for arbitrary precision.
 */
export default class ObfuskeyAlphabet {
  /**
   * The string representing the characters in the alphabet.
   * @private
   */
  private _alphabet: string;

  /**
   * The numerical base of the alphabet, equal to its length. Stored as BigInt.
   * @private
   */
  private _base: bigint;

  /**
   * Initializes a new `ObfuskeyAlphabet` instance.
   *
   * @param alphabet A string containing the unique characters to be used in the alphabet.
   * The order of characters determines their numerical value (index 0 for the first character, etc.).
   * @throws {DuplicateError} If the provided `alphabet` string contains duplicate characters.
   */
  constructor(alphabet: string) {
    if (new Set(alphabet).size !== alphabet.length) {
      throw new DuplicateError('The alphabet contains duplicate characters.');
    }

    this._alphabet = alphabet;
    this._base = BigInt(alphabet.length);
  }

  /**
   * Gets the alphabet string.
   * @returns {string} The string of characters used in this alphabet.
   * @readonly
   */
  public get alphabet(): string {
    return this._alphabet;
  }

  /**
   * Gets the numerical base of the alphabet (i.e., the number of unique characters).
   * @returns {bigint} The base as a BigInt.
   * @readonly
   */
  public get base(): bigint {
    return this._base;
  }

  /**
   * Gets the length of the alphabet, which is equivalent to its numerical base.
   * Provided for convenience.
   * @returns {bigint} The length of the alphabet as a BigInt.
   * @readonly
   */
  public get length(): bigint {
    return this._base;
  }

  /**
   * Returns the alphabet string itself when `toString()` is called.
   * @returns {string} The alphabet string.
   */
  public toString(): string {
    return this.alphabet;
  }

  /**
   * Returns the BigInt index of a given character within the alphabet.
   *
   * @param char The single character to find the index of.
   * @returns {bigint} The BigInt index of the character.
   * @throws {UnknownKeyError} If the character is not found in the alphabet.
   */
  public indexOf(char: string): bigint {
    if (char.length === 0) {
      throw new UnknownKeyError(
        'Cannot find index of an empty string in the alphabet.'
      );
    }

    if (char.length !== 1) {
      throw new UnknownKeyError(
        `Expected a single character, but received '${char}'.`
      );
    }

    const index = this._alphabet.indexOf(char);

    if (index === -1) {
      throw new UnknownKeyError(
        `Character '${char}' not found in the alphabet.`
      );
    }

    return BigInt(index);
  }

  /**
   * Returns the character at a given BigInt index in the alphabet.
   *
   * @param index The BigInt index of the character to retrieve.
   * @returns {string} The character at the specified index.
   * @throws {RangeError} If the `index` is negative or exceeds the alphabet's base.
   */
  public charAt(index: bigint): string {
    if (typeof index !== 'bigint') {
      throw new TypeError(
        "ObfuskeyAlphabet.charAt argument 'index' must be a BigInt."
      );
    }

    if (index < 0n || index >= this._base) {
      throw new RangeError(
        `Index ${index} is out of bounds for alphabet with base ${this._base}.`
      );
    }

    return this._alphabet[Number(index)];
  }

  /**
   * Calculates the maximum integer value that can be represented
   * using this alphabet for a given key length. This is calculated as
   * `(base ^ keyLength) - 1`.
   *
   * @param keyLength The length of the key (number of "digits" or characters).
   * This value must be non-negative. It can be a `number` or `bigint`.
   * @returns {bigint} The maximum representable value as a BigInt.
   * @throws {NegativeValueError} If `keyLength` is negative.
   */
  public getMaxValue(keyLength: number | bigint): bigint {
    const bigIntKeyLength = BigInt(keyLength);

    if (bigIntKeyLength < 0n) {
      throw new NegativeValueError('Key length cannot be negative.');
    }

    return this._base ** bigIntKeyLength - 1n;
  }
}
