# Obfuskey: Integer Packing and Obfuscation Library

**Note:** This library is a TypeScript/JavaScript port of the [Obfuskey Python package](https://github.com/bnlucas/obfuskey). It modernizes and simplifies the core functionality, focusing on generating obfuscated keys from integer values with uniform length using a specified alphabet.

Obfuskey is a TypeScript/JavaScript library designed for efficient packing and unpacking of multiple integer values into a single large integer (`BigInt`), and for robust obfuscation/de-obfuscation of these integers into short, human-readable string "keys". It's ideal for scenarios requiring compact data representation (e.g., URL parameters, short identifiers) with optional obfuscation.

The combination of key length and alphabet used will determine the maximum value it can obfuscate, `len(alphabet) ** key_length - 1n`.

## Features

* **Bit-packing**: Define a schema to pack multiple integer fields into a single `BigInt` or `Uint8Array`.
* **Bit-unpacking**: Retrieve individual integer fields from a packed `BigInt` or `Uint8Array`.
* **Arbitrary Precision**: Uses `BigInt` for all internal calculations, supporting values far beyond JavaScript's standard `Number` limit.
* **Customizable Alphabets**: Define your own character sets for key generation, allowing for base conversion up to Base94+.
* **Obfuscation**: Scramble packed integers into short, unique string keys using a configurable prime multiplier.
* **Error Handling**: Comprehensive custom error classes for clear debugging.
* **Modularity**: Separate concerns for schema definition, packing logic, and alphabet management.

## Installation

You can install `obfuskey` using npm or yarn:

```bash
npm install obfuskey
# or
yarn add obfuskey
```

## Usage

### Obfuskey - Basic Usage

To use Obfuskey, you can use one of the available alphabets, or provide your own. You can also provide your own multiplier, or leave it blank to use the built-in prime generator.

```typescript
import { Obfuskey, BASE36_ALPHABET, BASE62_ALPHABET } from 'obfuskey';

// Using default multiplier (randomly generated prime)
const obfuscator = new Obfuskey(BASE36_ALPHABET, 8); // key_length is optional, defaults to a calculated value

const key = obfuscator.getKey(1234567890n); // Example: 'FWQ8H52I'
const value = obfuscator.getValue('FWQ8H52I'); // Example: 1234567890n
console.log(`Key: ${key}, Value: ${value}`);

// Using a specific custom multiplier (must be an odd BigInt)
const obfuscatorCustom = new Obfuskey(BASE62_ALPHABET, 6, 46485n); // key_length 6, multiplier 46485n
const keyCustom = obfuscatorCustom.getKey(12345n); // Example: '0cpqVJ'
console.log(`Custom Multiplier Key: ${keyCustom}`);

// Using a custom alphabet string
const customAlphabetObfuscator = new Obfuskey('012345abcdef', 6); // Using key_length 6
const customKey = customAlphabetObfuscator.getKey(123n); // Example: '00000d'
console.log(`Custom Alphabet Key: ${customKey}`);
```

### Obfusbit - Packing Multiple Values

Obfusbit allows you to pack multiple integer values into a single obfuscated key string or a raw `BigInt`. You define a schema where each field has a name and a specified number of bits. Obfusbit will combine these values into a single large integer, which can then optionally be obfuscated by an `Obfuskey` instance. This is ideal for compact identifiers that encode multiple pieces of information.

#### Basic Packing and Unpacking (BigInt Output)

Define your schema and pack/unpack integers. This is useful if you want to store the packed integer in a database without obfuscation, or process it numerically.

```typescript
import { Obfusbit } from 'obfuskey';

// Define your data schema with field names and bit lengths
const productSchema = [
    { name: 'category_id', bits: 4n },  // Max value 15
    { name: 'item_id', bits: 20n },     // Max value ~1 million
    { name: 'status', bits: 3n },       // Max value 7 (e.g., in_stock=0, low=1, out=2)
];

// Initialize Obfusbit without an Obfuskey instance if you only need the raw BigInt
const obbIntPacker = new Obfusbit(productSchema);

// Values to pack (must be within the bit limits defined in the schema)
const valuesToPack = {
    category_id: 5n,
    item_id: 123456n,
    status: 1n, // Low stock
};

// Pack into a single BigInt (obfuscate=false for raw BigInt output)
const packedIdInt = obbIntPacker.pack(valuesToPack, false) as bigint;
console.log(`Packed Integer ID: ${packedIdInt}`); // Example: 809492485n

// Unpack back to original values
const unpackedValues = obbIntPacker.unpack(packedIdInt, false);
console.log(`Unpacked values:`, unpackedValues); // Example: { category_id: 5n, item_id: 123456n, status: 1n }
```

#### Determining Alphabet and Key Length for Obfusbit with Obfuskey

When using `Obfusbit` with an `Obfuskey` instance for obfuscation, it's crucial that the `Obfuskey` is configured to handle the maximum possible integer value that your schema can produce.

1.  **Calculate Total Bits Required by Schema:** Sum the `bits` for all fields in your `Obfusbit` schema. This sum represents the total number of bits needed to represent the packed integer.
    * Example: `[{bits: 4n}, {bits: 20n}, {bits: 3n}]` = `4n + 20n + 3n = 27n` total bits.
2.  **Calculate Maximum Value Represented by Schema:** The maximum integer value your schema can pack is `(2n ** totalBits) - 1n`.
    * Example: For 27n total bits, the maximum value is `(2n ** 27n) - 1n = 134217727n`.
3.  **Determine `Obfuskey` Capacity:** The maximum value an `Obfuskey` instance can obfuscate is determined by its alphabet size and key length: `(alphabet.base ** keyLength) - 1n`.
    * Example: Using `BASE58_ALPHABET` (alphabet base 58n) with `keyLength=5` gives `(58n ** 5n) - 1n = 656356799n`.

**The `Obfuskey`'s maximum capacity MUST be greater than or equal to the maximum value your schema can produce.** If it's smaller, `Obfusbit` will raise a `MaximumValueError` during initialization.

**Tips for Choosing:**

* **`totalBits`:** This is fixed by your schema requirements.
* **`alphabet`:**
    * **Smaller alphabets** (e.g., `BASE16_ALPHABET`, `BASE36_ALPHABET`) result in longer keys for the same `totalBits`. They are often easier to type or read.
    * **Larger alphabets** (e.g., `BASE58_ALPHABET`, `BASE62_ALPHABET`, `BASE64_URL_SAFE_ALPHABET`, `BASE94_ALPHABET`) result in shorter, more compact keys for the same `totalBits`. They might be less human-friendly but more efficient.
* **`keyLength`:** This is derived from your `totalBits` and chosen `alphabet`. You need to find the smallest `keyLength` such that `(len(alphabet) ** keyLength) - 1n` covers your `(2n ** totalBits) - 1n`.

**To determine the minimum `keyLength` required:**

Use the following TypeScript snippet. Just replace `YOUR_TOTAL_BITS` with the sum of bits from your schema and `YOUR_ALPHABET` with the desired alphabet constant (e.g., `BASE58_ALPHABET`).

```typescript
import { BASE58_ALPHABET, ObfuskeyAlphabet } from 'obfuskey';

const YOUR_TOTAL_BITS: bigint = 144n; // Example: Sum of bits from your Obfusbit schema
const YOUR_ALPHABET: ObfuskeyAlphabet = BASE58_ALPHABET; // Example: Choose your desired alphabet

// Calculate the number of states your schema needs to represent (2^N possibilities)
const requiredStates = 2n ** YOUR_TOTAL_BITS;

// Determine the alphabet's length (base)
const alphabetLength = YOUR_ALPHABET.base;

if (alphabetLength <= 1n) {
    throw new Error("Alphabet length must be greater than 1.");
}

// Calculate the minimum key length using logarithms
// This formula is derived from: alphabetLength ** keyLength >= 2 ** totalBits
// Which simplifies to: keyLength >= totalBits / log_alphabetLength(2)
// For BigInt, we approximate using Number for log calculations and then ceil.
const minimumKeyLength = Math.ceil(Number(YOUR_TOTAL_BITS) / Math.log2(Number(alphabetLength)));

console.log(`For ${YOUR_TOTAL_BITS} total bits and alphabet (length ${alphabetLength}):`);
console.log(`Minimum required key_length: ${minimumKeyLength}`);

// Optional: Verify the capacity with this calculated key_length
const maxObfuskeyValue = alphabetLength ** BigInt(minimumKeyLength) - 1n;
const maxSchemaValue = requiredStates - 1n;
    
console.log(`Maximum value Obfuskey can represent with this key_length: ${maxObfuskeyValue}`);
console.log(`Maximum value schema can produce: ${maxSchemaValue}`);
    
if (maxObfuskeyValue >= maxSchemaValue) {
    console.log("Obfuskey capacity is sufficient.");
} else {
    // This case should ideally not be reached if minimumKeyLength is correctly calculated
    console.log("WARNING: Obfuskey capacity is NOT sufficient. This indicates an issue with the calculation.");
}
```

#### Packing and Unpacking with Obfuscation (String Output)

To get a human-readable, fixed-length obfuscated key string, you associate an `Obfuskey` instance with `Obfusbit`. Ensure the `Obfuskey`'s `maximumValue` is large enough to cover the total bits in your schema, as checked during `Obfusbit` initialization.

```typescript
import { Obfuskey, Obfusbit, BASE58_ALPHABET } from 'obfuskey';
import { v4 as uuidv4 } from 'uuid'; // Assuming a UUID library like 'uuid' is installed
import { getDayOfYear } from 'date-fns'; // Assuming a date utility like 'date-fns' is installed

// Define a more complex schema, including a UUID
// UUIDs are 128-bit numbers.
const complexIdSchema = [
    { name: 'entity_uuid', bits: 128n },
    { name: 'version', bits: 4n },           // e.g., schema version (0-15)
    { name: 'creation_day', bits: 9n },      // Day of the year (1-366, needs 9 bits for 0-511)
    { name: 'environment_id', bits: 2n },    // e.g., 0=Dev, 1=Staging, 2=Prod (0-3)
    { name: 'is_active', bits: 1n },         // Boolean flag (0 or 1)
];

// Calculate required bits for this schema: 128 + 4 + 9 + 2 + 1 = 144 bits.
// For BASE58 (alphabet base 58), you need `Math.ceil(144 / Math.log2(58))` which is 25.
// Using key_length=26 provides a bit of buffer.
const obfuscatorLarge = new Obfuskey(BASE58_ALPHABET, 26); // Key length 26

// Initialize Obfusbit with the schema and the Obfuskey instance
// This will raise a MaximumValueError if obfuscatorLarge is too small for the schema.
const obbObfuscatedPacker = new Obfusbit(complexIdSchema, obfuscatorLarge);

// Prepare values for packing
const currentUuid = uuidv4();
// To convert UUID string to BigInt, you might need a helper function or library
// For demonstration, let's assume currentUuidAsBigInt is derived (e.g., from 'uuid-to-bigint' package)
// Or, if using a UUID library that directly exposes BigInt, like 'uuid-js' or a custom method.
// Example: Converting a UUID string to BigInt
function uuidToBigInt(uuid: string): bigint {
  const hex = uuid.replace(/-/g, '');
  return BigInt('0x' + hex);
}
const currentUuidAsBigInt = uuidToBigInt(currentUuid);

const currentDayOfYear = BigInt(getDayOfYear(new Date())); // Using date-fns for day of year

const valuesToPackComplex = {
    entity_uuid: currentUuidAsBigInt,
    version: 1n,
    creation_day: currentDayOfYear,
    environment_id: 2n, // Production
    is_active: 1n, // True
};

// Pack and obfuscate into a string
const obfuscatedCode = obbObfuscatedPacker.pack(valuesToPackComplex, true) as string;
console.log(`Obfuscated Complex ID: ${obfuscatedCode}`); // Example: T6ATbW8QpS3qBVACGganMCi4rU... (length 26)

// Unpack and de-obfuscate
const unpackedComplexValues = obbObfuscatedPacker.unpack(obfuscatedCode, true);
console.log(`Unpacked Complex Values:`, unpackedComplexValues);
// Example: { entity_uuid: ..., version: 1n, creation_day: ..., environment_id: 2n, is_active: 1n }

// Convert the UUID BigInt back to a UUID string for verification
const reconstructedUuid = uuidv4({
  random: Array.from({ length: 16 }, (_, i) => Number((unpackedComplexValues["entity_uuid"] ``` BigInt(8 * (15 - i))) & 0xFFn))
});
// Note: Direct BigInt to UUID conversion might need a more robust utility depending on your UUID library.
console.log(`Reconstructed UUID: ${reconstructedUuid}`);
// console.log(`Original UUID matches reconstructed: ${reconstructedUuid === currentUuid}`); // Compare strings

// This will raise a BitOverflowError if any single value exceeds its allocated bits in the schema.
```

### Large Integer Support

This TypeScript/JavaScript library leverages JavaScript's native `BigInt` primitive for handling integers. While `BigInt` itself supports arbitrary-precision integers, this library currently limits the maximum supported integer size to **511 bits or less**. Attempts to pack or obfuscate integers that require 512 bits or more will result in an error. This design choice helps maintain compatibility and performance within the library's specific use cases. No additional dependencies are required for arithmetic within this supported range.

## API Reference

### Classes

#### `Obfusbit`

The `Obfusbit` class facilitates the packing and unpacking of multiple integer values into a single large integer (`BigInt`) or an obfuscated string, based on a defined schema. It allows for efficient storage and transfer of structured data in a compact numerical format, with optional obfuscation provided by an `Obfuskey` instance.

```typescript
class Obfusbit {
  /**
   * Initializes an `Obfusbit` instance.
   * @param schema A schema definition array (`SchemaDefinition`) or an existing `ObfusbitSchema` object.
   * @param obfuskey An optional `Obfuskey` instance for obfuscating/de-obfuscating the packed integer.
   * @throws {MaximumValueError} If a provided `Obfuskey` cannot handle the maximum possible value representable by the schema.
   * @throws {SchemaValidationError} If the provided schema definition is invalid.
   */
  constructor(schema: SchemaDefinition | ObfusbitSchema, obfuskey?: Obfuskey);

  /**
   * Gets a copy of the raw schema definition used by this `Obfusbit` instance.
   */
  public get schema(): SchemaDefinition;

  /**
   * Gets the total number of bits required by the schema.
   */
  public get totalBits(): bigint;

  /**
   * Gets the maximum possible BigInt value that can be represented by this schema's total bit capacity.
   */
  public get maximumValue(): bigint;

  /**
   * Packs a dictionary of field values into a single `BigInt` or an obfuscated string key.
   * @param values A dictionary where keys are field names and values are their integer values.
   * @param obfuscate If `true`, the packed `BigInt` will be obfuscated using the `Obfuskey` instance.
   * @returns {bigint | string} The packed `BigInt` or the obfuscated string key.
   * @throws {ValueError} If a required field is missing, an unexpected field is provided, or if obfuscation is requested without an `Obfuskey` instance.
   * @throws {BitOverflowError} If any value exceeds its allocated bits in the schema or is negative.
   */
  public pack(values: Record<string, bigint>, obfuscate?: boolean): bigint | string;

  /**
   * Unpacks a packed `BigInt` or an obfuscated string key back into a dictionary of values.
   * @param packedData The `BigInt` or obfuscated string to unpack.
   * @param obfuscated If `true`, `packedData` is treated as an obfuscated string and de-obfuscated.
   * @returns {Record<string, number>} A dictionary where keys are field names and values are their unpacked integer values.
   * @throws {ValueError} If de-obfuscation is requested without an `Obfuskey` instance.
   * @throws {TypeError} If `packedData` type is incorrect for the `obfuscated` flag.
   */
  public unpack(packedData: bigint | string, obfuscated?: boolean): Record<string, bigint>;

  /**
   * Packs a dictionary of field values into a fixed-length `Uint8Array`.
   * @param values A dictionary where keys are field names and values are their integer values.
   * @param byteorder The byte order ('little' or 'big') for the output bytes. Defaults to 'big'.
   * @returns {Uint8Array} A `Uint8Array` representing the packed values.
   */
  public packBytes(values: Record<string, bigint>, byteorder?: 'little' | 'big'): Uint8Array;

  /**
   * Unpacks a fixed-length `Uint8Array` back into a dictionary of field values.
   * @param byteData The `Uint8Array` to unpack.
   * @param byteorder The byte order ('little' or 'big') of the input bytes. Defaults to 'big'.
   * @returns {Record<string, number>} A dictionary where keys are field names and values are their unpacked integer values.
   */
  public unpackBytes(byteData: Uint8Array, byteorder?: 'little' | 'big'): Record<string, bigint>;
}
```

#### `ObfusbitSchema`

The `ObfusbitSchema` class defines and validates a schema for bit-packing multiple numerical fields into a single integer. It stores information about each field's name, bit length, and its calculated bit shift position, enabling efficient packing and unpacking operations.

```typescript
class ObfusbitSchema {
  /**
   * Initializes a new `ObfusbitSchema` instance based on the provided schema definition.
   * @param schema An array of `FieldSchema` objects.
   * @throws {SchemaValidationError} If the provided schema definition is invalid.
   */
  constructor(schema: SchemaDefinition);

  /**
   * Gets the original schema definition array.
   */
  public get definition(): SchemaDefinition;

  /**
   * Gets the total number of bits required to store all fields in the schema.
   */
  public get totalBits(): bigint;

  /**
   * Gets the maximum integer value that can be represented by the total number of bits.
   */
  public get maximumValue(): bigint;

  /**
   * Gets a record mapping field names to their calculated `FieldInfo` (bits and shift).
   */
  public get fieldInfo(): Record<string, FieldInfo>;

  /**
   * Gets a Set of all field names defined in the schema.
   */
  public get fieldNames(): Set<string>;

  /**
   * Retrieves the `FieldInfo` (bits and shift) for a specific field by its name.
   * @param name The name of the field.
   * @returns {FieldInfo} An object containing the `bits` and `shift` for the specified field.
   * @throws {ValueError} If the specified field name is not found in the schema.
   */
  public getFieldInfo(name: string): FieldInfo;

  /**
   * Validates a set of input field values against the schema definition.
   * @param fields An object where keys are field names and values are the numerical inputs.
   * @throws {SchemaValidationError} If required fields are missing.
   * @throws {ValueError} If unexpected fields are provided.
   * @throws {BitOverflowError} If any field's value exceeds its defined bit capacity or is negative.
   */
  public validateFields(fields: Record<string, bigint>): void;
}
```

#### `Obfuskey`

The `Obfuskey` class provides functionality to obfuscate and de-obfuscate `BigInt` values into short, human-readable, and somewhat-randomized string "keys". It uses a specified alphabet for base conversion and an optional or generated prime multiplier for modular arithmetic to achieve obfuscation.

```typescript
class Obfuskey {
  /**
   * Initializes a new `Obfuskey` instance.
   * @param alphabet The `ObfuskeyAlphabet` instance to use for base conversion.
   * @param keyLength The desired fixed length of the generated obfuscated keys.
   * @param multiplier An optional BigInt multiplier to use for obfuscation.
   * @throws {MultiplierError} If a `multiplier` is provided and it is an even number.
   */
  constructor(alphabet: ObfuskeyAlphabet, keyLength: number, multiplier?: bigint);

  /**
   * Gets the `ObfuskeyAlphabet` instance associated with this `Obfuskey` instance.
   */
  public get alphabet(): ObfuskeyAlphabet;

  /**
   * Gets the fixed length of the generated obfuscated keys.
   */
  public get keyLength(): number;

  /**
   * Gets the BigInt multiplier used for obfuscation. It is generated on first access if not provided.
   */
  public get multiplier(): bigint;

  /**
   * Gets the maximum BigInt value that can be obfuscated by this `Obfuskey` instance.
   */
  public get maximumValue(): bigint;

  /**
   * Obfuscates a given BigInt `value` into a fixed-length string key.
   * @param value The BigInt value to obfuscate. Must be non-negative and less than or equal to `maximumValue`.
   * @returns {string} The obfuscated string key of `__keyLength` characters.
   * @throws {NegativeValueError} If the input `value` is negative.
   * @throws {MaximumValueError} If the input `value` exceeds the `maximumValue`.
   */
  public getKey(value: bigint): string;

  /**
   * De-obfuscates an `Obfuskey` string key back into its original BigInt value.
   * @param key The obfuscated string key to de-obfuscate. It must have the exact `keyLength`.
   * @returns {bigint} The original BigInt value.
   * @throws {KeyLengthError} If the input `key`'s length does not match the expected `keyLength`.
   */
  public getValue(key: string): bigint;
}
```

#### `ObfuskeyAlphabet`

The `ObfuskeyAlphabet` class defines the set of characters used for base conversion in `Obfuskey` and `Obfusbit`. It manages the alphabet string and its corresponding numerical base.

```typescript
class ObfuskeyAlphabet {
  /**
   * Initializes a new `ObfuskeyAlphabet` instance.
   * @param alphabet A string containing the unique characters to be used in the alphabet.
   * @throws {DuplicateError} If the provided `alphabet` string contains duplicate characters.
   */
  constructor(alphabet: string);

  /**
   * Gets the alphabet string.
   */
  public get alphabet(): string;

  /**
   * Gets the numerical base of the alphabet (i.e., the number of unique characters).
   */
  public get base(): bigint;

  /**
   * Gets the length of the alphabet, which is equivalent to its numerical base.
   */
  public get length(): bigint;

  /**
   * Returns the alphabet string itself when `toString()` is called.
   */
  public toString(): string;

  /**
   * Returns the BigInt index of a given character within the alphabet.
   * @param char The single character to find the index of.
   * @returns {bigint} The BigInt index of the character.
   * @throws {UnknownKeyError} If the character is not found in the alphabet.
   */
  public indexOf(char: string): bigint;

  /**
   * Returns the character at a given BigInt index in the alphabet.
   * @param index The BigInt index of the character to retrieve.
   * @returns {string} The character at the specified index.
   * @throws {RangeError} If the `index` is negative or exceeds the alphabet's base.
   */
  public charAt(index: bigint): string;

  /**
   * Calculates the maximum integer value that can be represented using this alphabet for a given key length.
   * @param keyLength The length of the key (number of "digits" or characters).
   * @returns {bigint} The maximum representable value as a BigInt.
   * @throws {NegativeValueError} If `keyLength` is negative.
   */
  public getMaxValue(keyLength: number | bigint): bigint;
}
```

### Constants

* `PRIME_MULTIPLIER`: A numerical factor (default `1.2`) used by `Obfuskey` when automatically generating a prime multiplier for obfuscation.

### Pre-defined Alphabets

The library provides several commonly used `ObfuskeyAlphabet` instances for convenience:

* `BASE16_ALPHABET`: `'0123456789ABCDEF'`
* `BASE32_ALPHABET`: `'234567ABCDEFGHIJKLMNOPQRSTUVWXYZ'`
* `BASE36_ALPHABET`: `'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'`
* `BASE52_ALPHABET`: `'0123456789BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz'`
* `BASE56_ALPHABET`: `'23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'` (similar to Base58 but excludes '0', '1', 'I', 'L', 'O', 'U' for clarity)
* `BASE58_ALPHABET`: `'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'` (Bitcoin-style Base58)
* `BASE62_ALPHABET`: `'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'`
* `BASE64_ALPHABET`: `'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/'`
* `BASE94_ALPHABET`: `'!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'`
* `CROCKFORD_BASE32_ALPHABET`: `'0123456789ABCDEFGHJKMNPQRSTVWXYZ'` (Crockford's Base32)
* `ZBASE32_ALPHABET`: `'ybndrfg8ejkmcpqxot1uwisza345h769'` (z-base32)
* `BASE64_URL_SAFE_ALPHABET`: `'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'`

### Errors

All custom errors in this library extend `ObfuskeyError`.

* `ObfuskeyError`: Base error class for all custom errors.
* `TypeError`: Thrown when an operand or argument is not of the expected type.
* `RangeError`: Thrown when a numerical variable or parameter is outside its valid range.
* `ValueError`: General-purpose error for invalid values or arguments (correct type, but inappropriate value).
* `DuplicateError`: Thrown when an alphabet contains duplicate characters.
* `UnknownKeyError`: Thrown when a character is not found in the defined alphabet.
* `KeyLengthError`: Thrown when an expected key length does not match the actual key length.
* `MaximumValueError`: Thrown when a numerical value exceeds the maximum allowed limit.
* `NegativeValueError`: Thrown when a negative numerical value is provided where non-negative is required.
* `MultiplierError`: Thrown when an invalid multiplier value is provided (e.g., not an odd integer).
* `SchemaValidationError`: Thrown during schema definition or validation within `ObfusbitSchema`.
* `BitOverflowError`: Thrown when an individual field's value exceeds its allocated bit capacity in the schema.

### Types

The library also exports several internal TypeScript types for better type safety when interacting with the API:

* `FieldInfo`: Describes a field's bits and calculated shift.
* `FieldSchema`: Defines a single field in a schema (name and bits).
* `SchemaDefinition`: An array of `FieldSchema` objects.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

MIT License

Copyright (c) 2022 Nathan Lucas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
