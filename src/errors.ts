/**
 * Base error class for all custom errors originating from the Obfuskey library.
 * All other specific error classes extend this class.
 */
export class ObfuskeyError extends Error {
  /**
   * Constructs an `ObfuskeyError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'ObfuskeyError';
  }
}

/**
 * Custom `TypeError` for the Obfuskey library.
 * Thrown when an operand or argument is not of the expected type.
 * Extends `ObfuskeyError` for consistent error handling within the library.
 */
export class TypeError extends ObfuskeyError {
  /**
   * Constructs a `TypeError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'TypeError';
  }
}

/**
 * Custom `RangeError` for the Obfuskey library.
 * Thrown when a numerical variable or parameter is outside its valid range.
 * Extends `ObfuskeyError` for consistent error handling within the library.
 */
export class RangeError extends ObfuskeyError {
  /**
   * Constructs a `RangeError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'RangeError';
  }
}

/**
 * General-purpose error for invalid values or arguments that do not fit other specific error categories.
 * Similar to Python's `ValueError`, this error indicates that a function received an argument
 * of the correct type but an inappropriate value.
 * Extends `ObfuskeyError` for consistent error handling within the library.
 */
export class ValueError extends ObfuskeyError {
  /**
   * Constructs a `ValueError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'ValueError';
  }
}

/**
 * Error thrown when an attempt is made to use an alphabet containing duplicate characters.
 * This indicates an invalid configuration for an `ObfuskeyAlphabet` instance.
 */
export class DuplicateError extends ObfuskeyError {
  /**
   * Constructs a `DuplicateError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateError';
  }
}

/**
 * Error thrown when a character is encountered that is not part of the defined alphabet.
 * This typically indicates an invalid character in an obfuscated key string or a lookup failure.
 */
export class UnknownKeyError extends ObfuskeyError {
  /**
   * Constructs an `UnknownKeyError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'UnknownKeyError';
  }
}

/**
 * Error thrown when an expected key length does not match the actual key length provided.
 * This commonly occurs during de-obfuscation if the obfuscated key string is malformed,
 * truncated, or has an unexpected length.
 */
export class KeyLengthError extends ObfuskeyError {
  /**
   * Constructs a `KeyLengthError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'KeyLengthError';
  }
}

/**
 * Error thrown when a numerical value exceeds the maximum allowed limit for a given operation or schema.
 * For example, if a value to be obfuscated is too large for the configured key length or
 * if a schema's total bit capacity is exceeded by a packed value.
 */
export class MaximumValueError extends ObfuskeyError {
  /**
   * Constructs a `MaximumValueError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'MaximumValueError';
  }
}

/**
 * Error thrown when a negative numerical value is provided to a function or method
 * that explicitly expects a non-negative input.
 */
export class NegativeValueError extends ObfuskeyError {
  /**
   * Constructs a `NegativeValueError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'NegativeValueError';
  }
}

/**
 * Error thrown when a multiplier value is invalid, typically because it is not an odd integer
 * when required by the obfuscation logic (e.g., for certain mathematical properties).
 */
export class MultiplierError extends ObfuskeyError {
  /**
   * Constructs a `MultiplierError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'MultiplierError';
  }
}

/**
 * Error thrown during schema definition or validation within `ObfusbitSchema`.
 * This indicates issues with how fields are defined (e.g., invalid bit counts, duplicate names)
 * or if input values do not conform to the schema's structure.
 */
export class SchemaValidationError extends ObfuskeyError {
  /**
   * Constructs a `SchemaValidationError` instance.
   * @param message A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Error thrown when an individual field's value exceeds its allocated bit capacity as defined in the schema.
 * This specifically applies during the packing process in `Obfusbit`.
 */
export class BitOverflowError extends ObfuskeyError {
  /**
   * Constructs a `BitOverflowError` instance.
   * @param field The name of the field that caused the overflow.
   * @param value The value that overflowed.
   * @param bits The number of bits allocated to the field.
   */
  constructor(field: string, value: bigint, bits: bigint) {
    const max = (1n << bits) - 1n;

    super(
      `Field '${field}' (${value}) exceeds its allocated ${bits} bits (maximum allowed: ${max}).`
    );

    this.name = 'BitOverflowError';
  }
}
