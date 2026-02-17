import { describe, it, expect } from 'vitest';
import { buildReelStrip, shuffleStrip, extractVisibleSymbols } from './reel-strip';
import { SeededRNG } from './rng';
import type { SymbolId } from './types';

describe('buildReelStrip', () => {
  it('should build strip with correct symbol counts', () => {
    const weights: Record<SymbolId, number> = {
      ORANGE: 5,
      GRAPE: 3,
      BELL: 2,
      BAR: 0,
      SEVEN: 0,
      DIAMOND: 0,
      WILD: 0,
      HANDCUFFS: 0,
      BANK: 0,
    };

    const strip = buildReelStrip(weights);

    expect(strip.length).toBe(10);
    expect(strip.filter((s) => s === 'ORANGE').length).toBe(5);
    expect(strip.filter((s) => s === 'GRAPE').length).toBe(3);
    expect(strip.filter((s) => s === 'BELL').length).toBe(2);
  });

  it('should throw error if all weights are zero', () => {
    const weights: Record<SymbolId, number> = {
      ORANGE: 0,
      GRAPE: 0,
      BELL: 0,
      BAR: 0,
      SEVEN: 0,
      DIAMOND: 0,
      WILD: 0,
      HANDCUFFS: 0,
      BANK: 0,
    };

    expect(() => buildReelStrip(weights)).toThrow('ReelStrip cannot be empty');
  });

  it('should ignore symbols with negative weights', () => {
    const weights: Record<SymbolId, number> = {
      ORANGE: 5,
      GRAPE: -3,
      BELL: 0,
      BAR: 0,
      SEVEN: 0,
      DIAMOND: 0,
      WILD: 0,
      HANDCUFFS: 0,
      BANK: 0,
    };

    const strip = buildReelStrip(weights);

    expect(strip.length).toBe(5);
    expect(strip.every((s) => s === 'ORANGE')).toBe(true);
  });
});

describe('shuffleStrip', () => {
  it('should shuffle strip deterministically with seeded RNG', () => {
    const strip: SymbolId[] = ['ORANGE', 'GRAPE', 'BELL', 'BAR', 'SEVEN'];

    const shuffled1 = shuffleStrip(strip, new SeededRNG(42));
    const shuffled2 = shuffleStrip(strip, new SeededRNG(42));

    expect(shuffled1).toEqual(shuffled2);
  });

  it('should preserve all symbols after shuffle', () => {
    const strip: SymbolId[] = ['ORANGE', 'GRAPE', 'BELL', 'BAR', 'SEVEN', 'DIAMOND'];

    const shuffled = shuffleStrip(strip, new SeededRNG(123));

    expect(shuffled.length).toBe(strip.length);
    expect(shuffled.sort()).toEqual(strip.sort());
  });

  it('should not modify original strip', () => {
    const strip: SymbolId[] = ['ORANGE', 'GRAPE', 'BELL'];
    const original = [...strip];

    shuffleStrip(strip, new SeededRNG(456));

    expect(strip).toEqual(original);
  });
});

describe('extractVisibleSymbols', () => {
  it('should extract correct number of visible symbols', () => {
    const strip: SymbolId[] = ['ORANGE', 'GRAPE', 'BELL', 'BAR', 'SEVEN'];

    const visible = extractVisibleSymbols(strip, 0, 3);

    expect(visible).toEqual(['ORANGE', 'GRAPE', 'BELL']);
  });

  it('should wrap around when reaching end of strip', () => {
    const strip: SymbolId[] = ['ORANGE', 'GRAPE', 'BELL', 'BAR', 'SEVEN'];

    const visible = extractVisibleSymbols(strip, 3, 4);

    expect(visible).toEqual(['BAR', 'SEVEN', 'ORANGE', 'GRAPE']);
  });

  it('should handle startIndex at end of strip', () => {
    const strip: SymbolId[] = ['ORANGE', 'GRAPE', 'BELL', 'BAR', 'SEVEN'];

    const visible = extractVisibleSymbols(strip, 4, 2);

    expect(visible).toEqual(['SEVEN', 'ORANGE']);
  });

  it('should throw error for empty strip', () => {
    const strip: SymbolId[] = [];

    expect(() => extractVisibleSymbols(strip, 0, 3)).toThrow('Strip cannot be empty');
  });

  it('should throw error for zero or negative visibleRows', () => {
    const strip: SymbolId[] = ['ORANGE', 'GRAPE', 'BELL'];

    expect(() => extractVisibleSymbols(strip, 0, 0)).toThrow(
      'visibleRows must be greater than 0',
    );
    expect(() => extractVisibleSymbols(strip, 0, -1)).toThrow(
      'visibleRows must be greater than 0',
    );
  });
});
