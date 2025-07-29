/**
 * Calculates the greatest common divisor (GCD) of two BigInt numbers using the Euclidean algorithm.
 * The GCD is the largest positive integer that divides both numbers without a remainder.
 *
 * @param a The first BigInt number.
 * @param b The second BigInt number.
 * @returns The greatest common divisor of `a` and `b` as a BigInt.
 */
export function gcd(a: bigint, b: bigint): bigint {
  if (typeof a !== 'bigint' || typeof b !== 'bigint') {
    throw new TypeError(
      `Expected bigint inputs, got: a=${typeof a}, b=${typeof b}`
    );
  }

  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;

  while (b !== 0n) {
    [a, b] = [b, a % b];
  }

  return a;
}
