import { describe, it, expect } from 'vitest';
import {
  ObfuskeyError,
  DuplicateError,
  KeyLengthError,
  UnknownKeyError,
  ValueError,
  TypeError,
  RangeError,
  MaximumValueError,
  MultiplierError,
  NegativeValueError,
  SchemaValidationError,
  BitOverflowError,
} from './errors.js'; // Adjust path if necessary

describe('Custom Error Classes', () => {
  // --- Test ObfuskeyError (Base Class) ---
  it('ObfuskeyError should be an instance of Error and have correct name/message', () => {
    const error = new ObfuskeyError('Base test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error.name).toBe('ObfuskeyError');
    expect(error.message).toBe('Base test message');
  });

  // --- Test Type Error ---
  it('TypeError should extend ObfuskeyError and have correct name/message', () => {
    const error = new TypeError('Invalid type provided.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(TypeError);
    expect(error.name).toBe('TypeError');
    expect(error.message).toBe('Invalid type provided.');
  });

  // --- Test Range Error ---
  it('RangeError should extend ObfuskeyError and have correct name/message', () => {
    const error = new RangeError('Index out of bounds.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(RangeError);
    expect(error.name).toBe('RangeError');
    expect(error.message).toBe('Index out of bounds.');
  });

  // --- Test Value Error ---
  it('ValueError should extend ObfuskeyError and have correct name/message', () => {
    const error = new ValueError('Invalid value for argument.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(ValueError);
    expect(error.name).toBe('ValueError');
    expect(error.message).toBe('Invalid value for argument.');
  });

  // --- Test Duplicate Error ---
  it('DuplicateError should extend ObfuskeyError and have correct name/message', () => {
    const error = new DuplicateError('Alphabet contains duplicates.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(DuplicateError);
    expect(error.name).toBe('DuplicateError');
    expect(error.message).toBe('Alphabet contains duplicates.');
  });

  // --- Test UnknownKeyError ---
  it('UnknownKeyError should extend ObfuskeyError and have correct name/message', () => {
    const error = new UnknownKeyError('Character not found.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(UnknownKeyError);
    expect(error.name).toBe('UnknownKeyError');
    expect(error.message).toBe('Character not found.');
  });

  // --- Test KeyLengthError ---
  it('KeyLengthError should extend ObfuskeyError and have correct name/message', () => {
    const error = new KeyLengthError('Key length mismatch.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(KeyLengthError);
    expect(error.name).toBe('KeyLengthError');
    expect(error.message).toBe('Key length mismatch.');
  });

  // --- Test MaximumValueError ---
  it('MaximumValueError should extend ObfuskeyError and have correct name/message', () => {
    const error = new MaximumValueError('Value exceeds max limit.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(MaximumValueError);
    expect(error.name).toBe('MaximumValueError');
    expect(error.message).toBe('Value exceeds max limit.');
  });

  // --- Test NegativeValueError ---
  it('NegativeValueError should extend ObfuskeyError and have correct name/message', () => {
    const error = new NegativeValueError('Negative value not allowed.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(NegativeValueError);
    expect(error.name).toBe('NegativeValueError');
    expect(error.message).toBe('Negative value not allowed.');
  });

  // --- Test MultiplierError ---
  it('MultiplierError should extend ObfuskeyError and have correct name/message', () => {
    const error = new MultiplierError('Invalid multiplier.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(MultiplierError);
    expect(error.name).toBe('MultiplierError');
    expect(error.message).toBe('Invalid multiplier.');
  });

  // --- Test SchemaValidationError ---
  it('SchemaValidationError should extend ObfuskeyError and have correct name/message', () => {
    const error = new SchemaValidationError('Invalid schema definition.');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ObfuskeyError);
    expect(error).toBeInstanceOf(SchemaValidationError);
    expect(error.name).toBe('SchemaValidationError');
    expect(error.message).toBe('Invalid schema definition.');
  });

  // --- Test BitOverflowError (Custom message generation) ---
  it('BitOverflowError should extend ObfuskeyError and generate correct message', () => {
    const error1 = new BitOverflowError('field1', 1000n, 8n);
    expect(error1).toBeInstanceOf(Error);
    expect(error1).toBeInstanceOf(ObfuskeyError);
    expect(error1).toBeInstanceOf(BitOverflowError);
    expect(error1.name).toBe('BitOverflowError');
    expect(error1.message).toBe(
      "Field 'field1' (1000) exceeds its allocated 8 bits (maximum allowed: 255)."
    );

    const error2 = new BitOverflowError('anotherField', 5n, 2n);
    expect(error2.message).toBe(
      "Field 'anotherField' (5) exceeds its allocated 2 bits (maximum allowed: 3)."
    );

    const error3 = new BitOverflowError('zeroBits', 1n, 0n);
    // Note: (1n << 0n) - 1n = 1n - 1n = 0n. So max allowed for 0 bits is 0.
    expect(error3.message).toBe(
      "Field 'zeroBits' (1) exceeds its allocated 0 bits (maximum allowed: 0)."
    );
  });
});
