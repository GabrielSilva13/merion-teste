import type { Payline } from './paylines';
import { getSymbolsOnPayline } from './paylines';
import type { Paytable } from './paytable';
import { getPayoutForSymbol } from './paytable';
import type { ReelStrip } from './reel-strip';
import { extractVisibleSymbols } from './reel-strip';
import type { RNG } from './rng';
import type { LineWin, Matrix, ReelSpinInfo, SpinResult, SymbolId } from './types';

export interface SlotMachineConfig {
  readonly reels: readonly ReelStrip[];
  readonly paylines: readonly Payline[];
  readonly paytable: Paytable;
  readonly rng: RNG;
  readonly visibleRows: number;
}

export class SlotMachine {
  private readonly reels: readonly ReelStrip[];
  private readonly paylines: readonly Payline[];
  private readonly paytable: Paytable;
  private readonly rng: RNG;
  private readonly visibleRows: number;

  constructor(config: SlotMachineConfig) {
    if (config.reels.length === 0) {
      throw new Error('At least one reel is required');
    }

    if (config.paylines.length === 0) {
      throw new Error('At least one payline is required');
    }

    if (config.visibleRows <= 0) {
      throw new Error('visibleRows must be greater than 0');
    }

    if (config.reels.length < config.visibleRows) {
      throw new Error('Reel strip length must be >= visibleRows');
    }

    this.reels = config.reels;
    this.paylines = config.paylines;
    this.paytable = config.paytable;
    this.rng = config.rng;
    this.visibleRows = config.visibleRows;
  }

  public spin(bet: number): SpinResult {
    if (bet <= 0) {
      throw new Error('Bet must be greater than 0');
    }

    const { matrix, reels } = this.generateMatrix();
    const wins = this.evaluateWins(matrix, bet);
    const totalWin = wins.reduce((sum, win) => sum + win.payout, 0);

    return {
      matrix,
      wins,
      totalWin,
      reels,
    };
  }

  private generateMatrix(): { matrix: Matrix; reels: ReelSpinInfo[] } {
    const matrix: Matrix = [];
    const reels: ReelSpinInfo[] = [];

    for (let reelIndex = 0; reelIndex < this.reels.length; reelIndex++) {
      const strip = this.reels[reelIndex];

      if (strip === undefined) {
        throw new Error(`Reel at index ${reelIndex} is undefined`);
      }

      const startIndex = this.rng.nextInt(strip.length);
      const visibleSymbols = extractVisibleSymbols(strip, startIndex, this.visibleRows);

      matrix.push(visibleSymbols);
      reels.push({ reelIndex, startIndex });
    }

    return { matrix, reels };
  }

  private evaluateWins(matrix: Matrix, bet: number): LineWin[] {
    const wins: LineWin[] = [];

    for (let paylineIndex = 0; paylineIndex < this.paylines.length; paylineIndex++) {
      const payline = this.paylines[paylineIndex];

      if (payline === undefined) {
        continue;
      }

      const symbols = getSymbolsOnPayline(matrix, payline);
      const win = this.evaluatePayline(symbols as SymbolId[], paylineIndex, bet);

      if (win) {
        wins.push(win);
      }
    }

    return wins;
  }

  private evaluatePayline(symbols: SymbolId[], paylineIndex: number, bet: number): LineWin | null {
    if (symbols.length === 0) {
      return null;
    }

    const firstSymbol = symbols[0];
    if (firstSymbol === undefined) {
      return null;
    }

    let consecutiveCount = 1;

    for (let i = 1; i < symbols.length; i++) {
      const currentSymbol = symbols[i];

      if (currentSymbol === undefined || currentSymbol !== firstSymbol) {
        break;
      }

      consecutiveCount++;
    }

    if (consecutiveCount < 3) {
      return null;
    }

    const basePayout = getPayoutForSymbol(this.paytable, firstSymbol as SymbolId, consecutiveCount);

    if (basePayout === 0) {
      return null;
    }

    return {
      paylineIndex,
      symbolId: firstSymbol,
      count: consecutiveCount,
      payout: basePayout * bet,
    };
  }

  public getReelCount(): number {
    return this.reels.length;
  }

  public getVisibleRows(): number {
    return this.visibleRows;
  }

  public getPaylineCount(): number {
    return this.paylines.length;
  }
}
