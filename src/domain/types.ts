export type SymbolId =
  | 'BANK'
  | 'ORANGE'
  | 'GRAPE'
  | 'BELL'
  | 'BAR'
  | 'SEVEN'
  | 'DIAMOND'
  | 'WILD'
  | 'HANDCUFFS'

export type Matrix = SymbolId[][];

export interface LineWin {
  readonly paylineIndex: number;
  readonly symbolId: SymbolId;
  readonly count: number;
  readonly payout: number;
}

export interface ReelSpinInfo {
  readonly reelIndex: number;
  readonly startIndex: number;
}

export interface SpinResult {
  readonly matrix: Matrix;
  readonly wins: readonly LineWin[];
  readonly totalWin: number;
  readonly reels: readonly ReelSpinInfo[];
}
