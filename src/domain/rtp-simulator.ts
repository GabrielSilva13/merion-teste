import type { SlotMachine } from './slot-machine';

export interface RTPSimulationResult {
  readonly rtp: number;
  readonly totalBet: number;
  readonly totalReturn: number;
  readonly spins: number;
  readonly wins: number;
  readonly hitRate: number;
}

export function simulateRTP(
  slotMachine: SlotMachine,
  spins: number,
  bet: number,
): RTPSimulationResult {
  if (spins <= 0) {
    throw new Error('spins must be greater than 0');
  }

  if (bet <= 0) {
    throw new Error('bet must be greater than 0');
  }

  let totalBet = 0;
  let totalReturn = 0;
  let wins = 0;

  for (let i = 0; i < spins; i++) {
    totalBet += bet;

    const result = slotMachine.spin(bet);
    totalReturn += result.totalWin;

    if (result.totalWin > 0) {
      wins++;
    }
  }

  const rtp = totalBet > 0 ? (totalReturn / totalBet) * 100 : 0;
  const hitRate = spins > 0 ? (wins / spins) * 100 : 0;

  return {
    rtp,
    totalBet,
    totalReturn,
    spins,
    wins,
    hitRate,
  };
}

export function calculateExpectedRTP(
  slotMachine: SlotMachine,
  iterations: number,
  spinsPerIteration: number,
  bet: number,
): number {
  if (iterations <= 0) {
    throw new Error('iterations must be greater than 0');
  }

  let totalRTP = 0;

  for (let i = 0; i < iterations; i++) {
    const result = simulateRTP(slotMachine, spinsPerIteration, bet);
    totalRTP += result.rtp;
  }

  return totalRTP / iterations;
}
