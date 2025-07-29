import {
  BitOverflowError,
  SchemaValidationError,
  ValueError,
} from './errors.js';
import { FieldInfo, FieldSchema, SchemaDefinition } from './types.js';
import { enumerate } from './utils/enumerate.js';

/**
 * The `ObfusbitSchema` class defines and validates a schema for bit-packing
 * multiple numerical fields into a single integer. It stores information about
 * each field's name, bit length, and its calculated bit shift position,
 * enabling efficient packing and unpacking operations.
 */
export default class ObfusbitSchema {
  /**
   * The original schema definition provided during construction.
   * @private
   */
  private __definition: SchemaDefinition;

  /**
   * The total number of bits required to store all fields defined in the schema.
   * This is the sum of `bits` for all fields.
   * @private
   */
  private __totalBits: bigint;

  /**
   * The maximum integer value that can be represented by the `__totalBits`.
   * Calculated as `(2^totalBits) - 1`.
   * @private
   */
  private __maximumValue: bigint;

  /**
   * A record mapping field names to their `FieldInfo` (containing `bits` and `shift` values).
   * This is pre-calculated for quick lookup during packing/unpacking.
   * @private
   */
  private __fieldInfo: Record<string, FieldInfo>;

  /**
   * A set containing all unique field names defined in the schema.
   * Used for efficient checking of field existence.
   * @private
   */
  private __fieldNames: Set<string>;

  /**
   * Initializes a new `ObfusbitSchema` instance based on the provided schema definition.
   * The constructor validates the schema structure and calculates necessary
   * bit properties and field information.
   *
   * @param schema An array of `FieldSchema` objects, where each object defines a field
   * with a `name` (string) and `bits` (number of bits).
   * @throws {SchemaValidationError} If the provided schema definition is invalid
   * (e.g., duplicate field names, non-string names, non-numeric bits, or non-positive bits).
   */
  constructor(schema: SchemaDefinition) {
    this.validateSchema(schema);

    this.__definition = schema;
    this.__totalBits = schema.reduce((sum, field) => sum + field.bits, 0n);
    this.__maximumValue = (1n << this.__totalBits) - 1n;
    this.__fieldInfo = this.calculateFieldInfo(schema);
    this.__fieldNames = new Set(schema.map((field) => field.name));
  }

  /**
   * Gets the original schema definition array.
   * @returns {SchemaDefinition} The array of `FieldSchema` objects.
   * @readonly
   */
  public get definition(): SchemaDefinition {
    return this.__definition;
  }

  /**
   * Gets the total number of bits required to store all fields in the schema.
   * @returns {number} The total bit count.
   * @readonly
   */
  public get totalBits(): bigint {
    return this.__totalBits;
  }

  /**
   * Gets the maximum integer value that can be represented by the total number of bits.
   * @returns {number} The maximum representable integer value.
   * @readonly
   */
  public get maximumValue(): bigint {
    return this.__maximumValue;
  }

  /**
   * Gets a record mapping field names to their calculated `FieldInfo` (bits and shift).
   * @returns {Record<string, FieldInfo>} An object where keys are field names and values are `FieldInfo` objects.
   * @readonly
   */
  public get fieldInfo(): Record<string, FieldInfo> {
    return this.__fieldInfo;
  }

  /**
   * Gets a Set of all field names defined in the schema.
   * @returns {Set<string>} A set containing the names of all fields.
   * @readonly
   */
  public get fieldNames(): Set<string> {
    return this.__fieldNames;
  }

  /**
   * Retrieves the `FieldInfo` (bits and shift) for a specific field by its name.
   *
   * @param name The name of the field to retrieve information for.
   * @returns {FieldInfo} An object containing the `bits` and `shift` for the specified field.
   * @throws {ValueError} If the specified field name is not found in the schema.
   */
  public getFieldInfo(name: string): FieldInfo {
    if (!this.__fieldNames.has(name)) {
      throw new ValueError(
        `Field '${name}' not found in the schema definition.`
      );
    }

    return this.__fieldInfo[name];
  }

  /**
   * Validates a set of input field values against the schema definition.
   * It checks for:
   * 1. All required fields are present.
   * 2. No unexpected fields are provided.
   * 3. Each field's value fits within its defined bit length (i.e., is non-negative and less than `2^bits`).
   *
   * @param fields An object where keys are field names and values are the numerical inputs for those fields.
   * @throws {Error} If required fields are missing.
   * @throws {ValueError} If unexpected fields are provided in the input.
   * @throws {BitOverflowError} If any field's value exceeds its defined bit capacity or is negative.
   */
  public validateFields(fields: Record<string, bigint>): void {
    const fieldNames = new Set(Object.keys(fields));
    const missingFields = [...this.__fieldNames].filter(
      (field) => !fieldNames.has(field)
    );

    if (missingFields.length > 0) {
      throw new SchemaValidationError(
        `Required values for the following fields are missing: ${missingFields.sort().join(', ')}.`
      );
    }

    const extraFields = [...fieldNames].filter(
      (field) => !this.__fieldNames.has(field)
    );

    if (extraFields.length > 0) {
      throw new ValueError(
        `Unexpected fields provided in input values: ${extraFields.sort().join(', ')}.`
      );
    }

    for (const [name, value] of Object.entries(fields)) {
      const field = this.__fieldInfo[name];

      if (value < 0n || value >= 1n << field.bits) {
        throw new BitOverflowError(name, value, field.bits);
      }
    }
  }

  /**
   * Internal method to validate the structure and content of the entire schema definition.
   * It iterates through each field in the schema and delegates detailed validation
   * to `validateSchemaItem`. It also tracks seen field names to detect duplicates.
   *
   * @param schema The schema definition array to validate.
   * @private
   * @throws {SchemaValidationError} For any structural or content issues in the schema.
   */
  private validateSchema(schema: SchemaDefinition): void {
    const seenFields: Set<string> = new Set();

    for (const [i, field] of enumerate(schema)) {
      this.validateSchemaItem(field, i, seenFields);
      seenFields.add(field['name']);
    }
  }

  /**
   * Internal method to validate a single field definition within the schema.
   * Checks for correct types (`name` as string, `bits` as number), positive bit count,
   * and uniqueness of field names.
   *
   * @param field The `FieldSchema` object representing a single field definition.
   * @param index The index of the field within the schema array, used for error messages.
   * @param seenFields A Set of field names already processed, used to detect duplicates.
   * @private
   * @throws {SchemaValidationError} If the field definition is invalid.
   */
  private validateSchemaItem(
    field: FieldSchema,
    index: number,
    seenFields: Set<string>
  ): void {
    const { name, bits } = field;

    if (typeof name !== 'string') {
      throw new SchemaValidationError(
        `Schema item (index ${index}): 'name' must be a string, got ${typeof name}.`
      );
    }

    if (typeof bits !== 'bigint') {
      throw new SchemaValidationError(
        `Schema item '${name}' (index ${index}): 'bits' must be a BigInt, got ${typeof bits}.`
      );
    }

    if (bits <= 0n) {
      throw new SchemaValidationError(
        `Schema field '${name}' (index ${index}): 'bits' must be a positive integer, got ${bits}.`
      );
    }

    if (seenFields.has(name)) {
      throw new SchemaValidationError(
        `Schema contains duplicate name: '${name}'. Names must be unique.`
      );
    }
  }

  /**
   * Internal method to calculate the bit shift for each field in the schema.
   * The shifts are calculated from the least significant bit (LSB) upwards,
   * by iterating through the schema in reverse order.
   *
   * @param schema The schema definition array.
   * @returns {Record<string, FieldInfo>} A record containing `bits` and `shift` for each field.
   * @private
   */
  private calculateFieldInfo(
    schema: SchemaDefinition
  ): Record<string, FieldInfo> {
    const reversedSchema: SchemaDefinition = [...schema].reverse();
    const fieldInfo: Record<string, FieldInfo> = {};
    let currentShift = 0n;

    for (const field of reversedSchema) {
      fieldInfo[field.name] = {
        bits: field.bits,
        shift: currentShift,
      };

      currentShift += field.bits;
    }

    return fieldInfo;
  }
}
