import { MaximumValueError, TypeError } from '../errors.js';
import { getBitLength } from '../utils/getBitLength.js';
import { isPrime } from './isPrime.js';

/**
 * Finds the next prime number greater than or equal to `n`.
 * This function iteratively checks numbers starting from `n` (or `n+1` if `n` is even)
 * and uses the `isPrime` function. It incorporates a wheel factorization pattern (2, 3, 5)
 * for efficient skipping of known composite numbers, and handles numbers up to 512 bits in length.
 *
 * @param n The starting BigInt number.
 * @returns The smallest prime number greater than or equal to `n` as a BigInt.
 * @throws {MaximumValueError} If `n` is a 512-bit integer or larger, as primality testing beyond this
 * size might be computationally prohibitive or require more robust algorithms.
 */
export function getNextPrime(n: bigint): bigint {
  if (typeof n !== 'bigint') {
    throw new TypeError("factor argument 'n' must be a BigInt.");
  }

  if (getBitLength(n) > 512n) {
    throw new MaximumValueError(
      '512-bit integers or larger are not supported for getNextPrime due to performance concerns.'
    );
  }

  if (n < 2n) {
    return 2n;
  }

  if (n < 5n) {
    return [3n, 5n, 5n][Number(n) - 2];
  }

  const gap = [
    1n,
    6n,
    5n,
    4n,
    3n,
    2n,
    1n,
    4n,
    3n,
    2n,
    1n,
    2n,
    1n,
    4n,
    3n,
    2n,
    1n,
    2n,
    1n,
    4n,
    3n,
    2n,
    1n,
    6n,
    5n,
    4n,
    3n,
    2n,
    1n,
    2n,
  ];

  n += 1n + (n & 1n);

  if (n % 3n === 0n || n % 5n === 0n) {
    n += gap[Number(n % 30n)];
  }

  while (!isPrime(n)) {
    n += gap[Number(n % 30n)];
  }

  return n;
}
