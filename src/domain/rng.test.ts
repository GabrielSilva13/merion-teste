import { describe, it, expect } from 'vitest';
import { DefaultRNG, SeededRNG } from './rng';

describe('DefaultRNG', () => {
  it('should generate numbers between 0 and 1', () => {
    const rng = new DefaultRNG();

    for (let i = 0; i < 100; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('should generate integers between 0 and max', () => {
    const rng = new DefaultRNG();
    const max = 10;

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(max);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(max);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('should throw error if max is zero or negative', () => {
    const rng = new DefaultRNG();

    expect(() => rng.nextInt(0)).toThrow('max must be greater than 0');
    expect(() => rng.nextInt(-5)).toThrow('max must be greater than 0');
  });
});

describe('SeededRNG', () => {
  it('should generate deterministic sequence with same seed', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);

    const sequence1 = Array.from({ length: 10 }, () => rng1.next());
    const sequence2 = Array.from({ length: 10 }, () => rng2.next());

    expect(sequence1).toEqual(sequence2);
  });

  it('should generate different sequences with different seeds', () => {
    const rng1 = new SeededRNG(111);
    const rng2 = new SeededRNG(222);

    const sequence1 = Array.from({ length: 10 }, () => rng1.next());
    const sequence2 = Array.from({ length: 10 }, () => rng2.next());

    expect(sequence1).not.toEqual(sequence2);
  });

  it('should generate numbers between 0 and 1', () => {
    const rng = new SeededRNG(42);

    for (let i = 0; i < 100; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('should generate deterministic integers', () => {
    const rng1 = new SeededRNG(999);
    const rng2 = new SeededRNG(999);

    const ints1 = Array.from({ length: 10 }, () => rng1.nextInt(100));
    const ints2 = Array.from({ length: 10 }, () => rng2.nextInt(100));

    expect(ints1).toEqual(ints2);
  });

  it('should allow seed manipulation', () => {
    const rng = new SeededRNG(100);

    const initialSeed = rng.getSeed();
    expect(initialSeed).toBe(100);

    rng.setSeed(200);
    expect(rng.getSeed()).toBe(200);
  });
});
