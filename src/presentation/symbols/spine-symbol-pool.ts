import type { SymbolId } from '@domain/types';
import { SymbolFactory } from './symbol-factory';
import type { SpineSymbol } from './spine-symbol';

const ALL_SYMBOL_IDS: readonly SymbolId[] = [
  'BANK', 'HANDCUFFS', 'ORANGE', 'GRAPE', 'BELL', 'BAR', 'SEVEN', 'DIAMOND', 'WILD',
];

const available = new Map<SymbolId, SpineSymbol[]>();

export namespace SpineSymbolPool {
  /**
   * Pre-create `count` instances of every symbol type so the first spin
   * never triggers Spine.from() / getBounds() mid-animation.
   */
  export function warmUp(symbolSize: number, countPerType = 4): void {
    for (const id of ALL_SYMBOL_IDS) {
      const bucket = available.get(id) ?? [];
      for (let i = 0; i < countPerType; i++) {
        const sym = SymbolFactory.create(id, symbolSize);
        sym.setAutoUpdate(false);
        bucket.push(sym);
      }
      available.set(id, bucket);
    }
  }

  export function acquire(symbolId: SymbolId, symbolSize: number): SpineSymbol {
    const bucket = available.get(symbolId);
    if (bucket && bucket.length > 0) {
      const symbol = bucket.pop()!;
      symbol.setAutoUpdate(true);
      symbol.playIdle();
      return symbol;
    }
    return SymbolFactory.create(symbolId, symbolSize);
  }

  export function release(symbol: SpineSymbol, symbolId: SymbolId): void {
    symbol.parent?.removeChild(symbol);
    symbol.setAutoUpdate(false);

    const bucket = available.get(symbolId);
    if (bucket) {
      bucket.push(symbol);
    } else {
      available.set(symbolId, [symbol]);
    }
  }

  /** Returns total instances currently stored in the pool (not in use). */
  export function pooledCount(): number {
    let total = 0;
    for (const bucket of available.values()) {
      total += bucket.length;
    }
    return total;
  }
}
