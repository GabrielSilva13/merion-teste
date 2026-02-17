import type { SymbolId } from './types';

export type MatchCount = 3 | 4 | 5;

export type PaytableEntry = Partial<Record<MatchCount, number>>;

export type Paytable = Record<SymbolId, PaytableEntry>;

export const DEFAULT_PAYTABLE: Paytable = {
  ORANGE: {
    3: 5,
    4: 20,
    5: 50,
  },
  GRAPE: {
    3: 10,
    4: 30,
    5: 75,
  },
  BELL: {
    3: 15,
    4: 40,
    5: 100,
  },
  BAR: {
    3: 20,
    4: 60,
    5: 150,
  },
  SEVEN: {
    3: 40,
    4: 120,
    5: 300,
  },
  DIAMOND: {
    3: 50,
    4: 150,
    5: 500,
  },
  WILD: {
    3: 100,
    4: 300,
    5: 1000,
  },
  HANDCUFFS: {
    3: 25,
    4: 80,
    5: 200,
  },
  BANK: {
    3: 30,
    4: 100,
    5: 250,
  },
} as const;

export function getPayoutForSymbol(
  paytable: Paytable,
  symbolId: SymbolId,
  count: number,
): number {
  if (count < 3 || count > 5) {
    return 0;
  }

  const entry = paytable[symbolId];
  if (!entry) {
    return 0;
  }

  const matchCount = count as MatchCount;
  return entry[matchCount] ?? 0;
}
