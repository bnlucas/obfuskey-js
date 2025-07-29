// src/ObfusbitSchema.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import ObfusbitSchema from './ObfusbitSchema.js';
import {
  BitOverflowError,
  SchemaValidationError,
  ValueError,
} from './errors.js';
import { FieldInfo, SchemaDefinition } from './types.js'; // Import types for clarity

describe('ObfusbitSchema', () => {
  // --- Test Valid Schema Initialization ---
  describe('Constructor with Valid Schema', () => {
    const schemaDefinition: SchemaDefinition = [
      { name: 'type', bits: 2n },
      { name: 'id', bits: 10n },
      { name: 'status', bits: 4n },
      { name: 'version', bits: 1n },
    ];
    let schema: ObfusbitSchema;

    beforeEach(() => {
      schema = new ObfusbitSchema(schemaDefinition);
    });

    it('should initialize correctly with a valid schema', () => {
      expect(schema).toBeInstanceOf(ObfusbitSchema);
      expect(schema.definition).toEqual(schemaDefinition);
    });

    it('should calculate totalBits correctly', () => {
      const expectedTotalBits = 2n + 10n + 4n + 1n; // Sum of bits
      expect(schema.totalBits).toBe(expectedTotalBits);
    });

    it('should calculate maximumValue correctly', () => {
      const expectedTotalBits = 2n + 10n + 4n + 1n;
      const expectedMaxValue = (1n << expectedTotalBits) - 1n;
      expect(schema.maximumValue).toBe(expectedMaxValue);
    });

    it('should calculate fieldInfo correctly', () => {
      const expectedFieldInfo: Record<string, FieldInfo> = {
        version: { bits: 1n, shift: 0n },
        status: { bits: 4n, shift: 1n }, // 0 + 1
        id: { bits: 10n, shift: 5n }, // 1 + 4
        type: { bits: 2n, shift: 15n }, // 5 + 10
      };
      expect(schema.fieldInfo).toEqual(expectedFieldInfo);
    });

    it('should populate fieldNames correctly', () => {
      const expectedFieldNames = new Set(['type', 'id', 'status', 'version']);
      expect(schema.fieldNames).toEqual(expectedFieldNames);
    });
  });

  // --- Test Invalid Schema Definitions ---
  describe('Constructor with Invalid Schema', () => {
    it('should throw SchemaValidationError for duplicate field names', () => {
      const invalidSchema: SchemaDefinition = [
        { name: 'field1', bits: 8n },
        { name: 'field2', bits: 8n },
        { name: 'field1', bits: 4n }, // Duplicate
      ];
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        SchemaValidationError
      );
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        "Schema contains duplicate name: 'field1'. Names must be unique."
      );
    });

    it('should throw SchemaValidationError if name is not a string', () => {
      const invalidSchema: SchemaDefinition = [
        { name: 'field1', bits: 8n },
        { name: 123 as any, bits: 4n }, // Invalid name type
      ];
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        SchemaValidationError
      );
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        "Schema item (index 1): 'name' must be a string, got number."
      );
    });

    it('should throw SchemaValidationError if bits is not a BigInt', () => {
      const invalidSchema: SchemaDefinition = [
        { name: 'field1', bits: 8n },
        { name: 'field2', bits: 4 as any }, // Invalid bits type
      ];
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        SchemaValidationError
      );
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        "Schema item 'field2' (index 1): 'bits' must be a BigInt, got number."
      );
    });

    it('should throw SchemaValidationError if bits is not positive (zero)', () => {
      const invalidSchema: SchemaDefinition = [
        { name: 'field1', bits: 8n },
        { name: 'field2', bits: 0n }, // Invalid bits value
      ];
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        SchemaValidationError
      );
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        "Schema field 'field2' (index 1): 'bits' must be a positive integer, got 0."
      );
    });

    it('should throw SchemaValidationError if bits is not positive (negative)', () => {
      const invalidSchema: SchemaDefinition = [
        { name: 'field1', bits: 8n },
        { name: 'field2', bits: -1n }, // Invalid bits value
      ];
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        SchemaValidationError
      );
      expect(() => new ObfusbitSchema(invalidSchema)).toThrow(
        "Schema field 'field2' (index 1): 'bits' must be a positive integer, got -1."
      );
    });
  });

  // --- Test getFieldInfo method ---
  describe('getFieldInfo', () => {
    const schemaDefinition: SchemaDefinition = [
      { name: 'alpha', bits: 3n },
      { name: 'beta', bits: 5n },
    ];
    const schema = new ObfusbitSchema(schemaDefinition);

    it('should return correct FieldInfo for an existing field', () => {
      expect(schema.getFieldInfo('alpha')).toEqual({ bits: 3n, shift: 5n }); // alpha is defined first, but has higher shift
      expect(schema.getFieldInfo('beta')).toEqual({ bits: 5n, shift: 0n });
    });

    it('should throw ValueError for a non-existent field', () => {
      expect(() => schema.getFieldInfo('gamma')).toThrow(ValueError);
      expect(() => schema.getFieldInfo('gamma')).toThrow(
        "Field 'gamma' not found in the schema definition."
      );
    });
  });

  // --- Test validateFields method ---
  describe('validateFields', () => {
    const schemaDefinition: SchemaDefinition = [
      { name: 'a', bits: 1n }, // Max value 1n
      { name: 'b', bits: 3n }, // Max value 7n
      { name: 'c', bits: 5n }, // Max value 31n
    ];
    const schema = new ObfusbitSchema(schemaDefinition);

    it('should validate correctly for valid field values', () => {
      const validFields = { a: 0n, b: 5n, c: 30n };
      expect(() => schema.validateFields(validFields)).not.toThrow();
    });

    it('should throw Error for missing required fields', () => {
      const missingFields = { a: 0n, b: 5n }; // 'c' is missing
      expect(() => schema.validateFields(missingFields)).toThrow(Error); // Note: Original error message is generic Error
      expect(() => schema.validateFields(missingFields)).toThrow(
        'Required values for the following fields are missing: c.'
      );

      const multipleMissingFields = { a: 0n }; // 'b', 'c' are missing
      expect(() => schema.validateFields(multipleMissingFields)).toThrow(
        'Required values for the following fields are missing: b, c.'
      );
    });

    it('should throw ValueError for unexpected fields', () => {
      const unexpectedFields = { a: 0n, b: 5n, c: 10n, d: 1n }; // 'd' is unexpected
      expect(() => schema.validateFields(unexpectedFields)).toThrow(ValueError);
      expect(() => schema.validateFields(unexpectedFields)).toThrow(
        'Unexpected fields provided in input values: d.'
      );

      const multipleUnexpectedFields = { a: 0n, b: 5n, c: 10n, d: 1n, e: 2n };
      expect(() => schema.validateFields(multipleUnexpectedFields)).toThrow(
        'Unexpected fields provided in input values: d, e.'
      );
    });

    it('should throw BitOverflowError for a negative field value', () => {
      const negativeValueFields = { a: -1n, b: 5n, c: 10n };
      expect(() => schema.validateFields(negativeValueFields)).toThrow(
        BitOverflowError
      );
      expect(() => schema.validateFields(negativeValueFields)).toThrow(
        `Field 'a' (-1) exceeds its allocated 1 bits (maximum allowed: 1).`
      );
    });

    it('should throw BitOverflowError for a field value exceeding its bit capacity', () => {
      const overflowValueFields = { a: 0n, b: 8n, c: 10n }; // 'b' bits=3, max 7 (2^3-1)
      expect(() => schema.validateFields(overflowValueFields)).toThrow(
        BitOverflowError
      );
      expect(() => schema.validateFields(overflowValueFields)).toThrow(
        `Field 'b' (8) exceeds its allocated 3 bits (maximum allowed: 7).`
      );

      const overflowMaxValueFields = { a: 2n, b: 5n, c: 10n }; // 'a' bits=1, max 0 (2^1-1)
      expect(() => schema.validateFields(overflowMaxValueFields)).toThrow(
        BitOverflowError
      );
      expect(() => schema.validateFields(overflowMaxValueFields)).toThrow(
        `Field 'a' (2) exceeds its allocated 1 bits (maximum allowed: 1).`
      );
    });
  });
});
