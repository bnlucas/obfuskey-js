import { MaximumValueError, ValueError } from './errors.js';
import ObfusbitSchema from './ObfusbitSchema.js';
import Obfuskey from './Obfuskey.js';
import { FieldInfo, SchemaDefinition } from './types.js';

/**
 * The `Obfusbit` class facilitates the packing and unpacking of multiple integer values
 * into a single large integer (represented as `BigInt`) or an obfuscated string,
 * based on a defined schema.
 *
 * It allows for efficient storage and transfer of structured data in a compact
 * numerical format, with optional obfuscation provided by an `Obfuskey` instance.
 */
export default class Obfusbit {
  /**
   * The `ObfusbitSchema` instance that defines how values are packed and unpacked.
   * @private
   */
  private __schema: ObfusbitSchema;

  /**
   * An optional `Obfuskey` instance used for obfuscating/de-obfuscating
   * the packed integer into a string.
   * @private
   */
  private __obfuskey?: Obfuskey;

  /**
   * The total number of bits required by the schema, as calculated by the `ObfusbitSchema`.
   * @private
   */
  private __totalBits: bigint;

  /**
   * The maximum possible integer value (as `BigInt`) that can be represented by this schema's
   * total bit capacity.
   * @private
   */
  private __maximumValue: bigint; // Will be BigInt due to schema's maximumValue

  /**
   * Initializes an `Obfusbit` instance with a schema and an optional `Obfuskey`.
   *
   * @param schema A schema definition array (`SchemaDefinition`) or an existing `ObfusbitSchema` object.
   * @param obfuskey An optional `Obfuskey` instance for obfuscating/de-obfuscating
   * the packed integer.
   * @throws {MaximumValueError} If a provided `Obfuskey` cannot handle the
   * maximum possible value representable by the schema.
   * @throws {SchemaValidationError} If the provided schema definition is invalid
   * (thrown by `ObfusbitSchema` constructor).
   */
  constructor(schema: SchemaDefinition | ObfusbitSchema, obfuskey?: Obfuskey) {
    if (schema instanceof ObfusbitSchema) {
      this.__schema = schema;
    } else {
      this.__schema = new ObfusbitSchema(schema);
    }

    this.__obfuskey = obfuskey;
    this.__totalBits = this.__schema.totalBits;
    this.__maximumValue = this.__schema.maximumValue;

    if (this.__obfuskey && this.__maximumValue > this.__obfuskey.maximumValue) {
      throw new MaximumValueError(
        `The provided schema requires a maximum packed integer value of ${this.__maximumValue} ` +
          `(which needs ${this.__totalBits} bits to represent), but the provided Obfuskey instance ` +
          `can only handle up to a maximum value of ${this.__obfuskey.maximumValue} ` +
          `(which covers ${this.__obfuskey.maximumValue.toString(2).length} bits).`
      );
    }
  }

  /**
   * Gets a copy of the raw schema definition used by this `Obfusbit` instance.
   * @returns {SchemaDefinition} An array of `FieldSchema` objects.
   * @readonly
   */
  public get schema(): SchemaDefinition {
    return this.__schema.definition;
  }

  /**
   * Gets the total number of bits required by the schema.
   * @returns {bigint} The total bit count.
   * @readonly
   */
  public get totalBits(): bigint {
    return this.__totalBits;
  }

  /**
   * Gets the maximum possible BigInt value that can be represented by this schema's
   * total bit capacity.
   * @returns {bigint} The maximum representable BigInt value.
   * @readonly
   */
  public get maximumValue(): bigint {
    return this.__maximumValue;
  }

  /**
   * Packs a dictionary of field values into a single `BigInt` or an obfuscated string key.
   *
   * The input `values` are validated against the schema for required fields,
   * unexpected fields, and individual value bit overflow.
   *
   * @param values A dictionary (JavaScript object) where keys are field names and values are their integer values.
   * @param obfuscate If `true`, the packed `BigInt` will be obfuscated using the
   * `Obfuskey` instance (if provided during initialization).
   * @returns {bigint | string} The packed `BigInt` or the obfuscated string key.
   * @throws {ValueError} If a required field is missing, an unexpected field is provided,
   * or if obfuscation is requested without an `Obfuskey` instance.
   * @throws {BitOverflowError} If any value exceeds its allocated bits in the schema or is negative.
   * @throws {MaximumValueError} If the packed integer exceeds the `Obfuskey`'s `maximumValue`
   * when obfuscation is enabled (thrown by `Obfuskey.getKey`).
   */
  public pack(
    values: Record<string, bigint>,
    obfuscate: boolean = false
  ): bigint | string {
    this.__schema.validateFields(values);

    let packedInt: bigint = 0n;

    for (const fieldName of Object.keys(this.__schema.fieldInfo)) {
      const info: FieldInfo = this.__schema.getFieldInfo(fieldName);
      const value: bigint = values[fieldName];
      const shift: bigint = info.shift;

      packedInt |= value << shift;
    }

    if (!obfuscate) {
      return packedInt;
    }

    if (!this.__obfuskey) {
      throw new ValueError(
        'An Obfuskey instance was not provided during initialization, but obfuscation was requested.'
      );
    }

    return this.__obfuskey.getKey(packedInt);
  }

  /**
   * Unpacks a packed `BigInt` or an obfuscated string key back into a dictionary of values.
   *
   * @param packedData The `BigInt` or obfuscated string to unpack.
   * @param obfuscated If `true`, `packedData` is treated as an obfuscated string
   * and de-obfuscated using the `Obfuskey` instance.
   * @returns {Record<string, number>} A dictionary (JavaScript object) where keys are field names
   * and values are their unpacked integer values.
   * @throws {ValueError} If de-obfuscation is requested without an `Obfuskey` instance.
   * @throws {TypeError} If `packedData` type is incorrect for the `obfuscated` flag.
   */
  public unpack(
    packedData: bigint | string,
    obfuscated: boolean = false
  ): Record<string, bigint> {
    let packedInt: bigint;
    const unpackedValues: Record<string, bigint> = {};

    if (obfuscated) {
      if (!this.__obfuskey) {
        throw new ValueError(
          'An Obfuskey instance was not provided during initialization, but de-obfuscation was requested.'
        );
      }

      if (typeof packedData !== 'string') {
        throw new TypeError(
          "Input 'packedData' must be a string when 'obfuscated' is true."
        );
      }

      packedInt = this.__obfuskey.getValue(packedData);
    } else {
      if (typeof packedData !== 'bigint') {
        throw new TypeError(
          "Input 'packedData' must be a BigInt when 'obfuscated' is false."
        );
      }

      packedInt = packedData;
    }

    for (const field of this.__schema.definition) {
      const info: FieldInfo = this.__schema.getFieldInfo(field.name);
      const mask: bigint = (1n << info.bits) - 1n;
      const value: bigint = (packedInt >> info.shift) & mask;

      unpackedValues[field.name] = value;
    }

    return unpackedValues;
  }

  /**
   * Packs a dictionary of field values into a fixed-length `Uint8Array`.
   * Internally calls `pack` to get the `BigInt` and then converts it to bytes.
   *
   * @param values A dictionary (JavaScript object) where keys are field names and values are their integer values.
   * @param byteorder The byte order ('little' or 'big') for the output bytes. Defaults to 'big'.
   * @returns {Uint8Array} A `Uint8Array` representing the packed values.
   * @throws {ValueError | BitOverflowError | MaximumValueError} Propagated from `pack` or internal byte conversion.
   */
  public packBytes(
    values: Record<string, bigint>,
    byteorder: 'little' | 'big' = 'big'
  ): Uint8Array {
    const packedInt: bigint = this.pack(values, false) as bigint;

    return this.intToBytesInternal(packedInt, byteorder);
  }

  /**
   * Unpacks a fixed-length `Uint8Array` back into a dictionary of field values.
   * Internally converts the bytes to a `BigInt` and then calls `unpack`.
   *
   * @param byteData The `Uint8Array` to unpack.
   * @param byteorder The byte order ('little' or 'big') of the input bytes. Defaults to 'big'.
   * @returns {Record<string, number>} A dictionary (JavaScript object) where keys are field names
   * and values are their unpacked integer values.
   * @throws {TypeError | ValueError} Propagated from `_bytesToIntInternal` or `unpack`.
   */
  public unpackBytes(
    byteData: Uint8Array,
    byteorder: 'little' | 'big' = 'big'
  ): Record<string, bigint> {
    const packedInt: bigint = this.bytesToIntInternal(byteData, byteorder);

    return this.unpack(packedInt, false);
  }

  /**
   * Calculates the minimum number of bytes needed to store the `totalBits` of the schema.
   * @private
   * @returns {number} The required byte length.
   */
  private getRequiredByteLength(): number {
    return Math.ceil(Number(this.__totalBits) / 8);
  }

  /**
   * Converts a packed `BigInt` into a `Uint8Array` (byte sequence).
   *
   * @private
   * @param packedInt The `BigInt` to convert.
   * @param byteorder The byte order ('little' or 'big').
   * @returns {Uint8Array} The bytes representation.
   * @throws {ValueError} If `packedInt` is out of the schema's range.
   */
  private intToBytesInternal(
    packedInt: bigint,
    byteorder: 'little' | 'big'
  ): Uint8Array {
    if (!(packedInt >= 0n && packedInt <= this.__maximumValue)) {
      throw new ValueError(
        `Packed integer ${packedInt} is out of range (0 to ${this.__maximumValue}) ` +
          "for the schema's total bit capacity."
      );
    }

    const byteLength = this.getRequiredByteLength();
    const bytes = new Uint8Array(byteLength);

    let tempPackedInt = packedInt;

    for (let i = 0; i < byteLength; i++) {
      const byteValue = Number(tempPackedInt & 0xffn);

      if (byteorder === 'big') {
        bytes[byteLength - 1 - i] = byteValue;
      } else {
        bytes[i] = byteValue;
      }

      tempPackedInt >>= 8n;
    }

    return bytes;
  }

  /**
   * Converts a `Uint8Array` (byte sequence) back into a `BigInt`.
   *
   * @private
   * @param byteData The `Uint8Array` to convert.
   * @param byteorder The byte order ('little' or 'big').
   * @returns {bigint} The `BigInt` representation.
   * @throws {TypeError} If `byteData` is not a `Uint8Array`.
   * @throws {ValueError} If `byteData` length does not match expected length for the schema.
   */
  private bytesToIntInternal(
    byteData: Uint8Array,
    byteorder: 'little' | 'big'
  ): bigint {
    if (!(byteData instanceof Uint8Array)) {
      throw new TypeError("Input 'byteData' must be a Uint8Array object.");
    }

    const expectedByteLength = this.getRequiredByteLength();

    if (byteData.length !== expectedByteLength) {
      throw new ValueError(
        `Byte data length (${byteData.length}) does not match expected length ` +
          `for this schema (${expectedByteLength} bytes based on ${this.__totalBits} bits).`
      );
    }

    let hex = '';

    if (byteorder === 'big') {
      for (let i = 0; i < byteData.length; i++) {
        hex += byteData[i].toString(16).padStart(2, '0');
      }
    } else {
      for (let i = byteData.length - 1; i >= 0; i--) {
        hex += byteData[i].toString(16).padStart(2, '0');
      }
    }

    return BigInt('0x' + hex);
  }
}
