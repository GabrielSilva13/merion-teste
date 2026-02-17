import { PAYLINES_10 } from './paylines';
import { DEFAULT_PAYTABLE } from './paytable';
import { buildReelStrip, shuffleStrip } from './reel-strip';
import { DefaultRNG, SeededRNG } from './rng';
import type { RNG } from './rng';
import { SlotMachine } from './slot-machine';
import type { SymbolId } from './types';

export const DEFAULT_SYMBOL_WEIGHTS: Record<SymbolId, number> = {
  ORANGE: 14,
  GRAPE: 14,
  BELL: 14,
  BAR: 14,
  SEVEN: 14,
  DIAMOND: 8,
  WILD: 2,
  HANDCUFFS: 10,
  BANK: 10,
} as const;

export interface SlotMachineFactoryConfig {
  readonly symbolWeights?: Record<SymbolId, number>;
  readonly visibleRows?: number;
  readonly rng?: RNG;
  readonly seed?: number;
}

export function createSlotMachine(config?: SlotMachineFactoryConfig): SlotMachine {
  const weights = config?.symbolWeights ?? DEFAULT_SYMBOL_WEIGHTS;
  const visibleRows = config?.visibleRows ?? 4;

  let rng: RNG;
  if (config?.rng) {
    rng = config.rng;
  } else if (config?.seed !== undefined) {
    rng = new SeededRNG(config.seed);
  } else {
    rng = new DefaultRNG();
  }

  const baseStrip = buildReelStrip(weights);

  const reels = Array.from({ length: 5 }, () => shuffleStrip(baseStrip, rng));

  return new SlotMachine({
    reels,
    paylines: PAYLINES_10,
    paytable: DEFAULT_PAYTABLE,
    rng,
    visibleRows,
  });
}

export function createDeterministicSlotMachine(seed: number): SlotMachine {
  return createSlotMachine({ seed });
}
