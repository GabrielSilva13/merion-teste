export interface RNG {
  next(): number;
  nextInt(max: number): number;
}

export class DefaultRNG implements RNG {
  public next(): number {
    return Math.random();
  }

  public nextInt(max: number): number {
    if (max <= 0) {
      throw new Error('max must be greater than 0');
    }
    return Math.floor(this.next() * max);
  }
}

export class SeededRNG implements RNG {
  private seed: number;

  constructor(initialSeed: number) {
    this.seed = initialSeed;
  }

  /**
   * Gera um número float aleatório entre 0 (inclusive) e 1 (exclusive)
   * utilizando o algoritmo de LCG (Linear Congruential Generator)
   * com as seguintes constantes:
   * a = 9301
   * c = 49297
   * m = 233280
   * x_n = (a * x_(n-1) + c) % m
   * return x_n / m
   */
  public next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  public nextInt(max: number): number {
    if (max <= 0) {
      throw new Error('max must be greater than 0');
    }
    return Math.floor(this.next() * max);
  }

  public getSeed(): number {
    return this.seed;
  }

  public setSeed(newSeed: number): void {
    this.seed = newSeed;
  }
}
