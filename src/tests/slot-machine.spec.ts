import { describe, it, expect } from 'vitest';
import { SlotMachine } from '@domain/slot-machine';
import { SeededRNG } from '@domain/rng';
import { buildReelStrip } from '@domain/reel-strip';
import { PAYLINES_10 } from '@domain/paylines';
import { DEFAULT_PAYTABLE } from '@domain/paytable';
import { simulateRTP } from '@domain/rtp-simulator';
import type { SymbolId } from '@domain/types';

describe('SlotMachine', () => {
  function createTestSlotMachine(seed = 12345) {
    const weights: Record<SymbolId, number> = {
      ORANGE: 14,
      GRAPE: 14,
      BELL: 14,
      BAR: 14,
      SEVEN: 14,
      DIAMOND: 8,
      WILD: 2,
      HANDCUFFS: 10,
      BANK: 10,
    };

    const reels = [
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
    ];

    return new SlotMachine({
      reels,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(seed),
      visibleRows: 4,
    });
  }

  it('should return a 5x4 matrix when spinning', () => {
    const slot = createTestSlotMachine();
    const result = slot.spin(10);

    expect(result.matrix).toHaveLength(5);
    for (const reel of result.matrix) {
      expect(reel).toHaveLength(4);
    }
  });

  it('should return reels info with correct length', () => {
    const slot = createTestSlotMachine();
    const result = slot.spin(10);

    expect(result.reels).toBeDefined();
    expect(result.reels).toHaveLength(5);
  });

  it('should return reels info with correct indices', () => {
    const slot = createTestSlotMachine();
    const result = slot.spin(10);

    for (let i = 0; i < result.reels.length; i++) {
      const reelInfo = result.reels[i];
      expect(reelInfo).toBeDefined();
      expect(reelInfo?.reelIndex).toBe(i);
      expect(reelInfo?.startIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it('should return deterministic startIndex with seeded RNG', () => {
    const slot1 = createTestSlotMachine(999);
    const slot2 = createTestSlotMachine(999);

    const result1 = slot1.spin(10);
    const result2 = slot2.spin(10);

    expect(result1.reels).toEqual(result2.reels);

    for (let i = 0; i < result1.reels.length; i++) {
      expect(result1.reels[i]?.startIndex).toBe(result2.reels[i]?.startIndex);
    }
  });

  it('should return consistent results with seeded RNG', () => {
    const slot1 = createTestSlotMachine(42);
    const slot2 = createTestSlotMachine(42);

    const result1 = slot1.spin(10);
    const result2 = slot2.spin(10);

    expect(result1.matrix).toEqual(result2.matrix);
    expect(result1.totalWin).toBe(result2.totalWin);
    expect(result1.reels).toEqual(result2.reels);
  });

  it('should detect 5 matching symbols on first payline', () => {
    // All positions are SEVEN so any startIndex yields SEVEN at row 0
    const reels = [
      ['SEVEN', 'SEVEN', 'SEVEN', 'SEVEN'] as SymbolId[],
      ['SEVEN', 'SEVEN', 'SEVEN', 'SEVEN'] as SymbolId[],
      ['SEVEN', 'SEVEN', 'SEVEN', 'SEVEN'] as SymbolId[],
      ['SEVEN', 'SEVEN', 'SEVEN', 'SEVEN'] as SymbolId[],
      ['SEVEN', 'SEVEN', 'SEVEN', 'SEVEN'] as SymbolId[],
    ];

    const slot = new SlotMachine({
      reels,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(1),
      visibleRows: 4,
    });

    const result = slot.spin(1);

    const firstPaylineWin = result.wins.find((w) => w.paylineIndex === 0);
    expect(firstPaylineWin).toBeDefined();
    expect(firstPaylineWin?.symbolId).toBe('SEVEN');
    expect(firstPaylineWin?.count).toBe(5);
  });

  it('should multiply payout by bet amount', () => {
    // Uniform reels guarantee ORANGE on every row regardless of startIndex
    const reels = [
      ['ORANGE', 'ORANGE', 'ORANGE', 'ORANGE'] as SymbolId[],
      ['ORANGE', 'ORANGE', 'ORANGE', 'ORANGE'] as SymbolId[],
      ['ORANGE', 'ORANGE', 'ORANGE', 'ORANGE'] as SymbolId[],
      ['ORANGE', 'ORANGE', 'ORANGE', 'ORANGE'] as SymbolId[],
      ['ORANGE', 'ORANGE', 'ORANGE', 'ORANGE'] as SymbolId[],
    ];

    const slot = new SlotMachine({
      reels,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(1),
      visibleRows: 4,
    });

    const result1 = slot.spin(1);
    const result10 = slot.spin(10);

    const win1 = result1.wins.find((w) => w.paylineIndex === 0);
    const win10 = result10.wins.find((w) => w.paylineIndex === 0);

    expect(win1).toBeDefined();
    expect(win10).toBeDefined();
    expect(win10?.payout).toBe((win1?.payout ?? 0) * 10);
  });

  it('should not detect wins with less than 3 consecutive symbols', () => {
    const reels = [
      ['ORANGE', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
      ['ORANGE', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
      ['GRAPE', 'SEVEN', 'DIAMOND', 'WILD'] as SymbolId[],
      ['BELL', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
      ['BAR', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
    ];

    const slot = new SlotMachine({
      reels,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(1),
      visibleRows: 4,
    });

    const result = slot.spin(10);
    const firstPaylineWin = result.wins.find((w) => w.paylineIndex === 0);

    expect(firstPaylineWin).toBeUndefined();
  });

  it('should stop counting at first different symbol', () => {
    // Uniform BELL for first 3 reels, uniform GRAPE for reel 4, uniform BELL for reel 5
    const reels = [
      ['BELL', 'BELL', 'BELL', 'BELL'] as SymbolId[],
      ['BELL', 'BELL', 'BELL', 'BELL'] as SymbolId[],
      ['BELL', 'BELL', 'BELL', 'BELL'] as SymbolId[],
      ['GRAPE', 'GRAPE', 'GRAPE', 'GRAPE'] as SymbolId[],
      ['BELL', 'BELL', 'BELL', 'BELL'] as SymbolId[],
    ];

    const slot = new SlotMachine({
      reels,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(1),
      visibleRows: 4,
    });

    const result = slot.spin(1);
    const firstPaylineWin = result.wins.find((w) => w.paylineIndex === 0);

    expect(firstPaylineWin).toBeDefined();
    expect(firstPaylineWin?.count).toBe(3);
    expect(firstPaylineWin?.symbolId).toBe('BELL');
  });

  it('should calculate total win as sum of all line wins', () => {
    const reels = [
      ['ORANGE', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
      ['ORANGE', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
      ['ORANGE', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
      ['ORANGE', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
      ['ORANGE', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
    ];

    const slot = new SlotMachine({
      reels,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(1),
      visibleRows: 4,
    });

    const result = slot.spin(1);
    const calculatedTotal = result.wins.reduce((sum, win) => sum + win.payout, 0);

    expect(result.totalWin).toBe(calculatedTotal);
    expect(result.wins.length).toBeGreaterThan(0);
  });

  it('should throw error if bet is zero or negative', () => {
    const slot = createTestSlotMachine();

    expect(() => slot.spin(0)).toThrow('Bet must be greater than 0');
    expect(() => slot.spin(-10)).toThrow('Bet must be greater than 0');
  });
});

describe('RTP Simulator', () => {
  it('should calculate RTP over multiple spins', () => {
    const weights: Record<SymbolId, number> = {
      ORANGE: 14,
      GRAPE: 14,
      BELL: 14,
      BAR: 14,
      SEVEN: 14,
      DIAMOND: 8,
      WILD: 2,
      HANDCUFFS: 10,
      BANK: 10,
    };

    const reels = [
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
    ];

    const slot = new SlotMachine({
      reels,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(12345),
      visibleRows: 4,
    });

    const result = simulateRTP(slot, 1000, 10);

    expect(result.spins).toBe(1000);
    expect(result.totalBet).toBe(10000);
    expect(result.totalReturn).toBeGreaterThanOrEqual(0);
    expect(result.rtp).toBeGreaterThanOrEqual(0);
    expect(result.rtp).toBeLessThanOrEqual(1000);
    expect(result.hitRate).toBeGreaterThanOrEqual(0);
    expect(result.hitRate).toBeLessThanOrEqual(100);
  });

  it('should produce deterministic results with seeded RNG', () => {
    const weights: Record<SymbolId, number> = {
      ORANGE: 14,
      GRAPE: 14,
      BELL: 14,
      BAR: 14,
      SEVEN: 14,
      DIAMOND: 8,
      WILD: 2,
      HANDCUFFS: 10,
      BANK: 10,
    };

    const reels1 = [
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
    ];

    const reels2 = [
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
      buildReelStrip(weights),
    ];

    const slot1 = new SlotMachine({
      reels: reels1,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(99999),
      visibleRows: 4,
    });

    const slot2 = new SlotMachine({
      reels: reels2,
      paylines: PAYLINES_10,
      paytable: DEFAULT_PAYTABLE,
      rng: new SeededRNG(99999),
      visibleRows: 4,
    });

    const result1 = simulateRTP(slot1, 100, 10);
    const result2 = simulateRTP(slot2, 100, 10);

    expect(result1.totalReturn).toBe(result2.totalReturn);
    expect(result1.rtp).toBe(result2.rtp);
  });
});
