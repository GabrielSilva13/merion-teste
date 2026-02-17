/**
 * Random Generator interface - Application layer
 * Abstração para geração de números aleatórios
 */

export interface RandomGenerator {
  /**
   * Gera um número inteiro aleatório entre min (inclusive) e max (exclusive)
   */
  nextInt(min: number, max: number): number;

  /**
   * Gera um número float aleatório entre 0 (inclusive) e 1 (exclusive)
   */
  nextFloat(): number;

  /**
   * Seleciona um item aleatório de um array
   */
  pick<T>(items: readonly T[]): T;

  /**
   * Embaralha um array (retorna nova instância)
   */
  shuffle<T>(items: readonly T[]): T[];
}
