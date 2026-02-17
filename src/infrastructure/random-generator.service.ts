import type { RandomGenerator } from '@application/interfaces/random-generator.interface';

/**
 * Random Generator Service - Infrastructure layer
 * Implementação concreta usando Math.random
 */

export class RandomGeneratorService implements RandomGenerator {
  public nextInt(min: number, max: number): number {
    if (min >= max) {
      throw new Error('min must be less than max');
    }
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public nextFloat(): number {
    return Math.random();
  }

  public pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const index = this.nextInt(0, items.length);
    const item = items[index];
    if (item === undefined) {
      throw new Error('Picked item is undefined');
    }
    return item;
  }

  public shuffle<T>(items: readonly T[]): T[] {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      const temp = array[i];
      const other = array[j];
      if (temp !== undefined && other !== undefined) {
        array[i] = other;
        array[j] = temp;
      }
    }
    return array;
  }
}
