// src/math/modInv.ts - The definitive, robust Extended Euclidean Algorithm

import { NegativeValueError, TypeError, ValueError } from '../errors.js';

/**
 * Calculates the modular multiplicative inverse of `base` modulo `mod` using the Extended Euclidean Algorithm.
 * The modular inverse `x` satisfies the congruence relation `(base * x) % mod = 1`.
 * An inverse exists if and only if `base` and `mod` are coprime (i.e., `gcd(base, mod) === 1`).
 *
 * @param base The BigInt number for which to find the modular inverse.
 * @param mod The modulus BigInt. Must be a positive integer.
 * @returns The modular inverse of `base` modulo `mod` as a BigInt.
 * @throws {NegativeValueError} If `mod` is not a positive integer.
 * @throws {ValueError} If a modular inverse does not exist (i.e., `base` and `mod` are not coprime).
 */
export function modInv(base: bigint, mod: bigint): bigint {
  if (typeof base !== 'bigint') {
    throw new TypeError("modInv argument 'base' must be a BigInt.");
  }

  if (typeof mod !== 'bigint') {
    throw new TypeError("modInv argument 'mod' must be a BigInt.");
  }

  if (mod <= 0n) {
    throw new NegativeValueError('mod must be a positive integer');
  }

  const a_init = ((base % mod) + mod) % mod;

  let r_prev = mod;
  let r_curr = a_init;

  let t_prev = 0n;
  let t_curr = 1n;

  while (r_curr !== 0n) {
    const q = r_prev / r_curr;

    const temp_r = r_prev - q * r_curr;
    r_prev = r_curr;
    r_curr = temp_r;

    const temp_t = t_prev - q * t_curr;
    t_prev = t_curr;
    t_curr = temp_t;
  }

  if (r_prev !== 1n) {
    throw new ValueError(
      `No modular inverse for ${base} mod ${mod} because they are not coprime (GCD is ${r_prev}).`
    );
  }

  return ((t_prev % mod) + mod) % mod;
}
