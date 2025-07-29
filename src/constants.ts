// Define a fixed-point precision scale.
// 18 decimal places corresponds to the precision of PRIME_MULTIPLIER
// and is a good general choice for decimal fixed-point arithmetic.
export const FIXED_POINT_SCALE = 1_000_000_000_000_000_000n; // 10^18 as a BigInt

// The default PRIME_MULTIPLIER constant (as a standard number/float)
// eslint-disable-next-line no-loss-of-precision
export const PRIME_MULTIPLIER: number = 1.618033988749894848;
