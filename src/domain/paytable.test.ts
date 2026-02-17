import { describe, it, expect } from 'vitest';
import { DEFAULT_PAYTABLE, getPayoutForSymbol } from './paytable';
import type { SymbolId } from './types';

describe('DEFAULT_PAYTABLE', () => {
  it('should have entries for all symbols', () => {
    const expectedSymbols: SymbolId[] = [
      'ORANGE',
      'GRAPE',
      'BELL',
      'BAR',
      'SEVEN',
      'DIAMOND',
      'WILD',
      'HANDCUFFS',
      'BANK',
    ];

    for (const symbol of expectedSymbols) {
      expect(DEFAULT_PAYTABLE[symbol]).toBeDefined();
    }
  });

  it('should have higher payouts for rarer symbols', () => {
    const orange5 = DEFAULT_PAYTABLE.ORANGE[5] ?? 0;
    const seven5 = DEFAULT_PAYTABLE.SEVEN[5] ?? 0;
    const wild5 = DEFAULT_PAYTABLE.WILD[5] ?? 0;

    expect(seven5).toBeGreaterThan(orange5);
    expect(wild5).toBeGreaterThan(seven5);
  });

  it('should have increasing payouts for more matches', () => {
    const bell3 = DEFAULT_PAYTABLE.BELL[3] ?? 0;
    const bell4 = DEFAULT_PAYTABLE.BELL[4] ?? 0;
    const bell5 = DEFAULT_PAYTABLE.BELL[5] ?? 0;

    expect(bell4).toBeGreaterThan(bell3);
    expect(bell5).toBeGreaterThan(bell4);
  });

  it('should have payouts for 3, 4, and 5 matches only', () => {
    for (const symbol of Object.keys(DEFAULT_PAYTABLE) as SymbolId[]) {
      const entry = DEFAULT_PAYTABLE[symbol];

      expect(entry[3]).toBeDefined();
      expect(entry[4]).toBeDefined();
      expect(entry[5]).toBeDefined();
    }
  });
});

describe('getPayoutForSymbol', () => {
  it('should return correct payout for valid matches', () => {
    const payout = getPayoutForSymbol(DEFAULT_PAYTABLE, 'SEVEN', 5);

    expect(payout).toBe(300);
  });

  it('should return 0 for less than 3 matches', () => {
    expect(getPayoutForSymbol(DEFAULT_PAYTABLE, 'ORANGE', 0)).toBe(0);
    expect(getPayoutForSymbol(DEFAULT_PAYTABLE, 'ORANGE', 1)).toBe(0);
    expect(getPayoutForSymbol(DEFAULT_PAYTABLE, 'ORANGE', 2)).toBe(0);
  });

  it('should return 0 for more than 5 matches', () => {
    expect(getPayoutForSymbol(DEFAULT_PAYTABLE, 'WILD', 6)).toBe(0);
    expect(getPayoutForSymbol(DEFAULT_PAYTABLE, 'WILD', 10)).toBe(0);
  });

  it('should return 0 if symbol has no entry for count', () => {
    const customPaytable = {
      ...DEFAULT_PAYTABLE,
      ORANGE: { 3: 10 },
    };

    expect(getPayoutForSymbol(customPaytable, 'ORANGE', 4)).toBe(0);
    expect(getPayoutForSymbol(customPaytable, 'ORANGE', 5)).toBe(0);
  });

  it('should handle all valid match counts (3, 4, 5)', () => {
    expect(getPayoutForSymbol(DEFAULT_PAYTABLE, 'BELL', 3)).toBe(15);
    expect(getPayoutForSymbol(DEFAULT_PAYTABLE, 'BELL', 4)).toBe(40);
    expect(getPayoutForSymbol(DEFAULT_PAYTABLE, 'BELL', 5)).toBe(100);
  });
});
