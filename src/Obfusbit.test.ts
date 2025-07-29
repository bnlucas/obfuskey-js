// src/Obfusbit.test.ts

// Imports for Vitest and project modules
import { describe, beforeEach, it, expect } from 'vitest';
import Obfusbit from './Obfusbit.js';
import ObfusbitSchema from './ObfusbitSchema.js';
import {
  MaximumValueError,
  ValueError,
  BitOverflowError,
  SchemaValidationError,
} from './errors.js';
import { SchemaDefinition } from './types.js';
import Obfuskey from './Obfuskey.js';
import * as alphabets from './alphabets.js';

// --- Test Suite for Obfusbit ---
describe('Obfusbit', () => {
  // Corresponds to Python's SIMPLE_SCHEMA_DEF
  const SIMPLE_SCHEMA_DEF: SchemaDefinition = [
    { name: 'id', bits: 10n }, // Max value 1023 (0x3FF)
    { name: 'type', bits: 2n }, // Max value 3 (0x3)
    { name: 'flag', bits: 1n }, // Max value 1 (0x1)
  ];

  // Variables to hold instances created by beforeEach, similar to pytest fixtures
  let simpleSchema: ObfusbitSchema;
  let obfuskeyInstance: Obfuskey;
  let obfuskeyTooSmall: Obfuskey;

  // beforeEach block to set up common test preconditions, akin to pytest fixtures
  beforeEach(() => {
    simpleSchema = new ObfusbitSchema(SIMPLE_SCHEMA_DEF);

    obfuskeyInstance = new Obfuskey(alphabets.BASE62_ALPHABET, 3);
    obfuskeyTooSmall = new Obfuskey(alphabets.BASE62_ALPHABET, 1);
  });

  // Data for parameterized tests (converted from Python's pytest.mark.parametrize)

  // Data for _int_to_bytes_internal tests (retained as test data, but not directly tested in 'it' block)
  const intToBytesCases = [
    {
      totalBits: 8n,
      packedInt: 255n,
      byteorder: 'big',
      expectedBytes: new Uint8Array([0xff]),
      expectedByteLength: 1,
    },
    {
      totalBits: 8n,
      packedInt: 0n,
      byteorder: 'big',
      expectedBytes: new Uint8Array([0x00]),
      expectedByteLength: 1,
    },
    {
      totalBits: 12n,
      packedInt: 1234n,
      byteorder: 'big',
      expectedBytes: new Uint8Array([0x04, 0xd2]),
      expectedByteLength: 2,
    },
    {
      totalBits: 12n,
      packedInt: 1234n,
      byteorder: 'little',
      expectedBytes: new Uint8Array([0xd2, 0x04]),
      expectedByteLength: 2,
    },
    {
      totalBits: 16n,
      packedInt: 65535n,
      byteorder: 'big',
      expectedBytes: new Uint8Array([0xff, 0xff]),
      expectedByteLength: 2,
    },
    {
      totalBits: 1n,
      packedInt: 1n,
      byteorder: 'big',
      expectedBytes: new Uint8Array([0x01]),
      expectedByteLength: 1,
    },
    {
      totalBits: 1n,
      packedInt: 0n,
      byteorder: 'big',
      expectedBytes: new Uint8Array([0x00]),
      expectedByteLength: 1,
    },
    {
      totalBits: 7n,
      packedInt: 127n,
      byteorder: 'big',
      expectedBytes: new Uint8Array([0x7f]),
      expectedByteLength: 1,
    },
    {
      totalBits: 9n,
      packedInt: 511n,
      byteorder: 'big',
      expectedBytes: new Uint8Array([0x01, 0xff]),
      expectedByteLength: 2,
    },
  ];

  // Data for _int_to_bytes_internal error cases (retained as test data)
  const intToBytesErrorCases = [
    {
      totalBits: 8n,
      packedInt: 256n,
      byteorder: 'big',
      errorMsg: `Packed integer 256 is out of range (0 to 255) for the schema's total bit capacity.`,
    },
    {
      totalBits: 8n,
      packedInt: -1n,
      byteorder: 'big',
      errorMsg: `Packed integer -1 is out of range (0 to 255) for the schema's total bit capacity.`,
    },
  ];

  // Data for _bytes_to_int_internal tests (retained as test data)
  const bytesToIntCases = [
    {
      totalBits: 8n,
      byteData: new Uint8Array([0xff]),
      byteorder: 'big',
      expectedInt: 255n,
      expectedByteLength: 1,
    },
    {
      totalBits: 8n,
      byteData: new Uint8Array([0x00]),
      byteorder: 'big',
      expectedInt: 0n,
      expectedByteLength: 1,
    },
    {
      totalBits: 12n,
      byteData: new Uint8Array([0x04, 0xd2]),
      byteorder: 'big',
      expectedInt: 1234n,
      expectedByteLength: 2,
    },
    {
      totalBits: 12n,
      byteData: new Uint8Array([0xd2, 0x04]),
      byteorder: 'little',
      expectedInt: 1234n,
      expectedByteLength: 2,
    },
    {
      totalBits: 16n,
      byteData: new Uint8Array([0xff, 0xff]),
      byteorder: 'big',
      expectedInt: 65535n,
      expectedByteLength: 2,
    },
  ];

  // Data for _bytes_to_int_internal error cases (retained as test data)
  const bytesToIntErrorCases = [
    {
      totalBits: 8n,
      byteData: 'not_bytes' as any,
      byteorder: 'big',
      errorType: TypeError,
      errorMsg: "Input 'byteData' must be a Uint8Array object.",
    },
    {
      totalBits: 8n,
      byteData: new Uint8Array([0xff, 0x00]),
      byteorder: 'big',
      errorType: ValueError,
      errorMsg: `Byte data length (2) does not match expected length for this schema (1 bytes based on 8 bits).`,
    },
    {
      totalBits: 16n,
      byteData: new Uint8Array([0xff]),
      byteorder: 'big',
      errorType: ValueError,
      errorMsg: `Byte data length (1) does not match expected length for this schema (2 bytes based on 16 bits).`,
    },
  ];

  // Data for test_pack_raises_value_error
  const invalidPackInputCases: Array<{
    invalid_data: Record<string, any>;
    error_type: new (...args: any[]) => Error;
    error_message: string | RegExp;
  }> = [
    {
      invalid_data: {},
      error_type: SchemaValidationError,
      error_message:
        'Required values for the following fields are missing: flag, id, type.',
    },
    {
      invalid_data: { id: 1n, type: 1n, flag: 1n, extra: 1n } as any,
      error_type: ValueError,
      error_message: 'Unexpected fields provided in input values: extra.',
    },
    {
      invalid_data: { id: 1n, type: 1n } as any,
      error_type: SchemaValidationError,
      error_message:
        'Required values for the following fields are missing: flag.',
    },
    {
      invalid_data: { id: 1024n, type: 1n, flag: 1n },
      error_type: BitOverflowError,
      error_message:
        "Field 'id' (1024) exceeds its allocated 10 bits (maximum allowed: 1023).",
    },
    {
      invalid_data: { id: -1n, type: 1n, flag: 1n },
      error_type: BitOverflowError,
      error_message:
        "Field 'id' (-1) exceeds its allocated 10 bits (maximum allowed: 1023).",
    },
    {
      invalid_data: { id: 'not_int' as any, type: 1n, flag: 1n },
      error_type: TypeError,
      error_message:
        'Cannot mix BigInt and other types, use explicit conversions',
    },
  ];

  // Data for unpacking errors when obfuscated is FALSE
  const invalidUnpackNonObfuscatedInputCases: Array<{
    packed_data: bigint | string;
    error_type: new (...args: any[]) => Error;
    error_message: string | RegExp;
  }> = [
    {
      packed_data: 'not_int' as any,
      error_type: TypeError,
      error_message:
        "Input 'packedData' must be a BigInt when 'obfuscated' is false.",
    },
  ];

  // Data for unpacking errors when obfuscated is TRUE
  const invalidUnpackObfuscatedInputCases: Array<{
    packed_data: bigint | string;
    error_type: new (...args: any[]) => Error;
    error_message: string | RegExp;
  }> = [
    {
      packed_data: 123n,
      error_type: TypeError,
      error_message:
        "Input 'packedData' must be a string when 'obfuscated' is true.",
    },
    {
      packed_data: 'some_string',
      error_type: ValueError,
      error_message:
        'An Obfuskey instance was not provided during initialization, but de-obfuscation was requested.',
    },
  ];

  // Common values for packing/unpacking success tests
  const commonValues = { id: 100n, type: 2n, flag: 1n };
  const expectedPackedInt = 805n; // 0b11001001001 (100 << 3) | (2 << 1) | (1 << 0)

  // --- Constructor Tests ---
  describe('Constructor', () => {
    it('should initialize correctly with a list of dictionaries for schema', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      expect(obfusbit['__schema']).toBeInstanceOf(ObfusbitSchema);
      expect(obfusbit.totalBits).toBe(13n);
      expect(obfusbit.maximumValue).toBe(8191n);
      expect(obfusbit['__obfuskey']).toBeUndefined();
    });

    it('should initialize correctly with an existing ObfusbitSchema object', () => {
      const obfusbit = new Obfusbit(simpleSchema);
      expect(obfusbit['__schema']).toBe(simpleSchema);
      expect(obfusbit.totalBits).toBe(13n);
      expect(obfusbit.maximumValue).toBe(8191n);
      expect(obfusbit['__obfuskey']).toBeUndefined();
    });

    it('should initialize correctly with an Obfuskey instance', () => {
      const obfusbit = new Obfusbit(simpleSchema, obfuskeyInstance);
      expect(obfusbit['__schema']).toBe(simpleSchema);
      expect(obfusbit.totalBits).toBe(13n);
      expect(obfusbit.maximumValue).toBe(8191n);
      expect(obfusbit['__obfuskey']).toBe(obfuskeyInstance);
    });

    it("should raise MaximumValueError if Obfuskey cannot handle schema's max value", () => {
      expect(() => {
        new Obfusbit(simpleSchema, obfuskeyTooSmall);
      }).toThrow(MaximumValueError);
      expect(() => {
        new Obfusbit(simpleSchema, obfuskeyTooSmall);
      }).toThrow(
        /The provided schema requires a maximum packed integer value of 8191/
      );
    });

    it('should propagate SchemaValidationError from ObfusbitSchema', () => {
      const invalidSchemaDef = [{ name: 'f1', bits: 0n }];
      expect(() => {
        new Obfusbit(invalidSchemaDef as any);
      }).toThrow(SchemaValidationError);
      expect(() => {
        new Obfusbit(invalidSchemaDef as any);
      }).toThrow(
        /Schema field 'f1' \(index 0\): 'bits' must be a positive integer, got 0./
      );
    });
  });

  // --- Public Properties Tests ---
  describe('Public Properties', () => {
    it('should return correct values for public properties', () => {
      const obfusbit = new Obfusbit(simpleSchema, obfuskeyInstance);
      expect(obfusbit.totalBits).toBe(13n);
      expect(obfusbit.maximumValue).toBe(8191n);
      expect(obfusbit.schema).toBe(simpleSchema.definition);

      const obfusbitNoKey = new Obfusbit(simpleSchema);
      expect(obfusbitNoKey.totalBits).toBe(13n);
      expect(obfusbitNoKey.maximumValue).toBe(8191n);
      expect(obfusbitNoKey.schema).toBe(simpleSchema.definition);
    });
  });

  // --- Packing and Unpacking Methods (BigInt/String) ---
  describe('Packing and Unpacking (BigInt/String)', () => {
    it('should correctly pack and unpack values based on schema', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const packedValue = obfusbit.pack(commonValues);
      expect(packedValue).toBe(expectedPackedInt);

      const unpackedValues = obfusbit.unpack(packedValue);
      expect(unpackedValues).toEqual(commonValues);
    });

    it('should correctly pack and unpack values with obfuscation', () => {
      const obfusbitWithKey = new Obfusbit(SIMPLE_SCHEMA_DEF, obfuskeyInstance);
      const packedKey = obfusbitWithKey.pack(commonValues, true) as string;
      expect(typeof packedKey).toBe('string');
      expect(packedKey.length).toBeGreaterThan(0);

      const unpackedValues = obfusbitWithKey.unpack(packedKey, true);
      expect(unpackedValues).toEqual(commonValues);
    });

    it('should raise correct errors for invalid input data during packing', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF); // Does not need Obfuskey for these tests

      for (const {
        invalid_data,
        error_type,
        error_message,
      } of invalidPackInputCases) {
        expect(() => {
          obfusbit.pack(invalid_data);
        }).toThrow(error_type);

        if (typeof error_message === 'string') {
          expect(() => {
            obfusbit.pack(invalid_data);
          }).toThrow(error_message);
        } else {
          expect(() => {
            obfusbit.pack(invalid_data);
          }).toThrow(error_message);
        }
      }
    });

    it('should raise ValueError if obfuscation is requested during packing without an Obfuskey', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF); // No Obfuskey provided

      expect(() => {
        obfusbit.pack(commonValues, true);
      }).toThrow(ValueError);
      expect(() => {
        obfusbit.pack(commonValues, true);
      }).toThrow(
        'An Obfuskey instance was not provided during initialization, but obfuscation was requested.'
      );
    });

    it('should raise correct errors for invalid input during non-obfuscated unpacking', () => {
      const obfusbitNoKey = new Obfusbit(SIMPLE_SCHEMA_DEF);

      for (const {
        packed_data,
        error_type,
        error_message,
      } of invalidUnpackNonObfuscatedInputCases) {
        expect(() => {
          obfusbitNoKey.unpack(packed_data, false);
        }).toThrow(error_type);

        if (typeof error_message === 'string') {
          expect(() => {
            obfusbitNoKey.unpack(packed_data, false);
          }).toThrow(error_message);
        } else {
          expect(() => {
            obfusbitNoKey.unpack(packed_data, false);
          }).toThrow(error_message);
        }
      }
    });

    it('should raise correct errors for invalid input during obfuscated unpacking', () => {
      // Test cases that specifically need an Obfuskey instance
      const obfusbitWithKey = new Obfusbit(SIMPLE_SCHEMA_DEF, obfuskeyInstance);
      for (const {
        packed_data,
        error_type,
        error_message,
      } of invalidUnpackObfuscatedInputCases) {
        if (
          error_message ===
          'An Obfuskey instance was not provided during initialization, but de-obfuscation was requested.'
        ) {
          // This specific error should be tested with an Obfusbit instance *without* a key
          const obfusbitWithoutKey = new Obfusbit(SIMPLE_SCHEMA_DEF);
          expect(() => {
            obfusbitWithoutKey.unpack(packed_data, true);
          }).toThrow(error_type);
          expect(() => {
            obfusbitWithoutKey.unpack(packed_data, true);
          }).toThrow(error_message);
        } else {
          expect(() => {
            obfusbitWithKey.unpack(packed_data, true);
          }).toThrow(error_type);
          if (typeof error_message === 'string') {
            expect(() => {
              obfusbitWithKey.unpack(packed_data, true);
            }).toThrow(error_message);
          } else {
            expect(() => {
              obfusbitWithKey.unpack(packed_data, true);
            }).toThrow(error_message);
          }
        }
      }
    });
  });

  // --- Byte Packing and Unpacking Methods (Uint8Array) ---
  describe('Byte Packing and Unpacking (Uint8Array)', () => {
    const expectedBytesBigEndian = new Uint8Array([0x03, 0x25]); // 805 as 2 bytes big-endian
    const expectedBytesLittleEndian = new Uint8Array([0x25, 0x03]); // 805 as 2 bytes little-endian

    it('should correctly pack values to Uint8Array (big-endian)', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const packedBytes = obfusbit.packBytes(commonValues, 'big');
      expect(packedBytes).toEqual(expectedBytesBigEndian);
    });

    it('should correctly pack values to Uint8Array (little-endian)', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const packedBytes = obfusbit.packBytes(commonValues, 'little');
      expect(packedBytes).toEqual(expectedBytesLittleEndian);
    });

    it('should propagate BitOverflowError when packing bytes', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const valuesWithOverflow = { id: 100n, type: 4n, flag: 1n }; // type=4 exceeds 2 bits

      expect(() => {
        obfusbit.packBytes(valuesWithOverflow);
      }).toThrow(BitOverflowError);
      expect(() => {
        obfusbit.packBytes(valuesWithOverflow);
      }).toThrow(
        "Field 'type' (4) exceeds its allocated 2 bits (maximum allowed: 3)."
      );
    });

    it('should propagate SchemaValidationError (missing field) when packing bytes', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const valuesMissingField = { id: 100n, type: 2n }; // flag is missing

      expect(() => {
        obfusbit.packBytes(valuesMissingField);
      }).toThrow(SchemaValidationError);
      expect(() => {
        obfusbit.packBytes(valuesMissingField);
      }).toThrow('Required values for the following fields are missing: flag.');
    });

    it('should propagate ValueError (unexpected field) when packing bytes', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const valuesUnexpectedField = {
        id: 100n,
        type: 2n,
        flag: 1n,
        extra: 5n,
      } as any;

      expect(() => {
        obfusbit.packBytes(valuesUnexpectedField);
      }).toThrow(ValueError);
      expect(() => {
        obfusbit.packBytes(valuesUnexpectedField);
      }).toThrow('Unexpected fields provided in input values: extra.');
    });

    it('should correctly unpack Uint8Array to values (big-endian)', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const unpackedValues = obfusbit.unpackBytes(
        expectedBytesBigEndian,
        'big'
      );
      expect(unpackedValues).toEqual(commonValues);
    });

    it('should correctly unpack Uint8Array to values (little-endian)', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const unpackedValues = obfusbit.unpackBytes(
        expectedBytesLittleEndian,
        'little'
      );
      expect(unpackedValues).toEqual(commonValues);
    });

    it('should raise TypeError for invalid input type during unpackBytes', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const invalidByteData = 'not_bytes_data' as any;

      expect(() => {
        obfusbit.unpackBytes(invalidByteData);
      }).toThrow(TypeError);
      expect(() => {
        obfusbit.unpackBytes(invalidByteData);
      }).toThrow("Input 'byteData' must be a Uint8Array object.");
    });

    it('should raise ValueError for incorrect Uint8Array length during unpackBytes (too short)', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const shortByteData = new Uint8Array([0x01]); // Expected 2 bytes, got 1

      expect(() => {
        obfusbit.unpackBytes(shortByteData);
      }).toThrow(ValueError);
      expect(() => {
        obfusbit.unpackBytes(shortByteData);
      }).toThrow(
        /Byte data length \(1\) does not match expected length for this schema \(2 bytes based on 13 bits\)\./
      );
    });

    it('should raise ValueError for incorrect Uint8Array length during unpackBytes (too long)', () => {
      const obfusbit = new Obfusbit(SIMPLE_SCHEMA_DEF);
      const longByteData = new Uint8Array([0x01, 0x02, 0x03]); // Expected 2 bytes, got 3

      expect(() => {
        obfusbit.unpackBytes(longByteData);
      }).toThrow(ValueError);
      expect(() => {
        obfusbit.unpackBytes(longByteData);
      }).toThrow(
        /Byte data length \(3\) does not match expected length for this schema \(2 bytes based on 13 bits\)\./
      );
    });
  });
});
