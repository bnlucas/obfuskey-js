/**
 * A generator function that yields pairs of `[index, item]` for an iterable,
 * similar to Python's `enumerate` built-in function.
 *
 * @template T The type of elements in the iterable.
 * @param iterable The iterable object (e.g., Array, Set, Map, String) to enumerate.
 * @returns A `Generator` that yields tuples `[number, T]`, where the number is the index
 * and T is the item from the iterable.
 *
 * @example
 * ```typescript
 * for (const [index, char] of enumerate("hello")) {
 *   console.log(`${index}: ${char}`);
 * }
 * // Expected output:
 * // 0: h
 * // 1: e
 * // 2: l
 * // 3: l
 * // 4: o
 * ```
 */
export function* enumerate<T>(iterable: Iterable<T>): Generator<[number, T]> {
  let index = 0;

  for (const item of iterable) {
    yield [index++, item];
  }
}
