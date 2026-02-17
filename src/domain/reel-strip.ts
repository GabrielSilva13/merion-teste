import type { SymbolId } from './types';
import type { RNG } from './rng';

export type ReelStrip = SymbolId[];

export function buildReelStrip(weights: Record<SymbolId, number>): ReelStrip {
  const strip: SymbolId[] = [];

  for (const symbolId of Object.keys(weights) as SymbolId[]) {
    const weight = weights[symbolId];
    if (weight === undefined || weight <= 0) {
      continue;
    }

    for (let i = 0; i < weight; i++) {
      strip.push(symbolId);
    }
  }

  if (strip.length === 0) {
    throw new Error('ReelStrip cannot be empty');
  }

  return strip;
}

export function shuffleStrip(strip: ReelStrip, rng: RNG): ReelStrip {
  const shuffled = [...strip];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);

    const temp = shuffled[i];
    const other = shuffled[j];

    if (temp !== undefined && other !== undefined) {
      shuffled[i] = other;
      shuffled[j] = temp;
    }
  }

  return shuffled;
}

export function extractVisibleSymbols(
  strip: ReelStrip,
  startIndex: number,
  visibleRows: number,
): SymbolId[] {
  if (strip.length === 0) {
    throw new Error('Strip cannot be empty');
  }

  if (visibleRows <= 0) {
    throw new Error('visibleRows must be greater than 0');
  }

  const visible: SymbolId[] = [];

  for (let i = 0; i < visibleRows; i++) {
    const index = (startIndex + i) % strip.length;
    const symbol = strip[index];

    if (symbol === undefined) {
      throw new Error(`Symbol at index ${index} is undefined`);
    }

    visible.push(symbol);
  }

  return visible;
}
