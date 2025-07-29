import { describe, it, expect } from 'vitest';
import { FIXED_POINT_SCALE, PRIME_MULTIPLIER } from './constants.js'; // Adjust path if necessary

describe('Constants', () => {
  it('FIXED_POINT_SCALE should have the correct BigInt value and type', () => {
    // Assert the exact BigInt value
    expect(FIXED_POINT_SCALE).toBe(1_000_000_000_000_000_000n);
    // Assert its type
    expect(typeof FIXED_POINT_SCALE).toBe('bigint');
  });

  it('PRIME_MULTIPLIER should have the correct number value and type', () => {
    // Assert the exact floating-point value
    // For exact literal numbers, toBe is usually fine.
    // If there were any calculation involved, toBeCloseTo might be preferred.
    expect(PRIME_MULTIPLIER).toBe(1.618033988749894848);
    // Assert its type
    expect(typeof PRIME_MULTIPLIER).toBe('number');
  });
});
