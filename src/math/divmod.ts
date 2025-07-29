/**
 * Performs integer division and calculates the remainder (modulo) simultaneously,
 * mimicking Python's `divmod` behavior (floor division for quotient,
 * remainder takes the sign of the divisor).
 * Returns a tuple `[quotient, remainder]`.
 *
 * @param a The dividend BigInt number.
 * @param b The divisor BigInt number.
 * @returns A tuple `[quotient, remainder]` as BigInts.
 * @throws {TypeError} If `a` and `b` are not both BigInts.
 * @throws {RangeError} If the divisor `b` is zero.
 */
export function divmod(a: bigint, b: bigint): [bigint, bigint] {
  if (typeof a !== 'bigint' || typeof b !== 'bigint') {
    throw new TypeError('divmod arguments must both be BigInts.');
  }

  if (b === 0n) {
    throw new RangeError('division by zero');
  }

  let q = a / b;
  let r = a % b;

  if (r !== 0n && ((r < 0n && b > 0n) || (r > 0n && b < 0n))) {
    q = q - 1n;
    r = r + b;
  }

  return [q, r];
}
