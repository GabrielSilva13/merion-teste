import type { RNG } from '@domain/rng';
import type { SlotMachine } from '@domain/slot-machine';
import type { SpinResult } from '@domain/types';

export interface SlotApiConfig {
  readonly slotMachine: SlotMachine;
  readonly rng: RNG;
  readonly minLatency?: number;
  readonly maxLatency?: number;
}

export class FakeSlotApi {
  private readonly slotMachine: SlotMachine;
  private readonly rng: RNG;
  private readonly minLatency: number;
  private readonly maxLatency: number;

  constructor(config: SlotApiConfig) {
    this.slotMachine = config.slotMachine;
    this.rng = config.rng;
    this.minLatency = config.minLatency ?? 300;
    this.maxLatency = config.maxLatency ?? 800;

    if (this.minLatency < 0) {
      throw new Error('minLatency cannot be negative');
    }

    if (this.maxLatency < this.minLatency) {
      throw new Error('maxLatency must be >= minLatency');
    }
  }

  public async spin(bet: number): Promise<SpinResult> {
    const latency = this.generateLatency();

    await this.delay(latency);

    const result = this.slotMachine.spin(bet);

    return result;
  }

  private generateLatency(): number {
    const range = this.maxLatency - this.minLatency;
    const randomValue = this.rng.next();
    return Math.floor(this.minLatency + randomValue * range);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
