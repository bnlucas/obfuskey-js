// src/utils/enumerate.test.ts

import { describe, it, expect } from 'vitest';
import { enumerate } from './enumerate.js';

describe('enumerate', () => {
  it('should yield nothing for an empty array', () => {
    const result = Array.from(enumerate([]));
    expect(result).toEqual([]);
  });

  it('should yield nothing for an empty string', () => {
    const result = Array.from(enumerate(''));
    expect(result).toEqual([]);
  });

  it('should yield nothing for an empty Set', () => {
    const result = Array.from(enumerate(new Set()));
    expect(result).toEqual([]);
  });

  it('should yield nothing for an empty Map', () => {
    const result = Array.from(enumerate(new Map()));
    expect(result).toEqual([]);
  });

  it('should correctly enumerate an array of numbers', () => {
    const arr = [10, 20, 30];
    const result = Array.from(enumerate(arr));
    expect(result).toEqual([
      [0, 10],
      [1, 20],
      [2, 30],
    ]);
  });

  it('should correctly enumerate an array of strings', () => {
    const arr = ['apple', 'banana', 'cherry'];
    const result = Array.from(enumerate(arr));
    expect(result).toEqual([
      [0, 'apple'],
      [1, 'banana'],
      [2, 'cherry'],
    ]);
  });

  it('should correctly enumerate an array with null and undefined elements', () => {
    const arr = [1, null, 3, undefined, 5];
    const result = Array.from(enumerate(arr));
    expect(result).toEqual([
      [0, 1],
      [1, null],
      [2, 3],
      [3, undefined],
      [4, 5],
    ]);
  });

  it('should correctly enumerate a string', () => {
    const str = 'hello';
    const result = Array.from(enumerate(str));
    expect(result).toEqual([
      [0, 'h'],
      [1, 'e'],
      [2, 'l'],
      [3, 'l'],
      [4, 'o'],
    ]);
  });

  it('should correctly enumerate a Set', () => {
    const set = new Set(['a', 'b', 'c']);
    const result = Array.from(enumerate(set));
    // Order of Set iteration is insertion order in modern JS
    expect(result).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
  });

  it('should correctly enumerate a Map', () => {
    const map = new Map<string, number>([
      ['key1', 100],
      ['key2', 200],
    ]);
    const result = Array.from(enumerate(map));
    // Map iterates [key, value] pairs
    expect(result).toEqual([
      [0, ['key1', 100]],
      [1, ['key2', 200]],
    ]);
  });

  it('should correctly enumerate a custom iterable (generator function)', () => {
    function* customGenerator() {
      yield 'foo';
      yield 'bar';
      yield 'baz';
    }
    const result = Array.from(enumerate(customGenerator()));
    expect(result).toEqual([
      [0, 'foo'],
      [1, 'bar'],
      [2, 'baz'],
    ]);
  });

  it('should ensure the index increments correctly for each item', () => {
    const arr = ['a', 'b', 'c'];
    const enumerated = enumerate(arr);

    let next = enumerated.next();
    expect(next.value).toEqual([0, 'a']);
    expect(next.done).toBe(false);

    next = enumerated.next();
    expect(next.value).toEqual([1, 'b']);
    expect(next.done).toBe(false);

    next = enumerated.next();
    expect(next.value).toEqual([2, 'c']);
    expect(next.done).toBe(false);

    next = enumerated.next();
    expect(next.value).toBeUndefined();
    expect(next.done).toBe(true);
  });
});
