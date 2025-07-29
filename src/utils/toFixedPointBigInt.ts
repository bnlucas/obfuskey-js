import { TypeError } from '../errors.js';

/**
 * Helper function to convert a regular JavaScript `number` (which is a float)
 * to a BigInt fixed-point representation. This is typically used when you need to
 * perform BigInt arithmetic on values that originate as floating-point numbers.
 *
 * @param num The number (float) to convert.
 * @param scale The BigInt scale factor (e.g., `10n ** 18n` for 18 decimal places of precision).
 * @returns The number as a BigInt scaled by the fixed point factor.
 * @remarks It's crucial to acknowledge that the input `num` itself might carry floating-point inaccuracies
 * even before this conversion. `Math.round` is used to get the closest integer after scaling
 * to minimize conversion errors, but inherent floating-point limitations may still apply.
 */
export function toFixedPointBigInt(num: number, scale: bigint): bigint {
  if (typeof num !== 'number') {
    throw new TypeError("toFixedPointBigInt argument 'num' must be a Number.");
  }

  if (typeof scale !== 'bigint') {
    throw new TypeError(
      "toFixedPointBigInt argument 'scale' must be a BigInt."
    );
  }

  return BigInt(Math.round(num * Number(scale)));
}
