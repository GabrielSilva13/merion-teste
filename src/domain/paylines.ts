export type Payline = readonly number[];

export const PAYLINES_10: readonly Payline[] = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [1, 2, 1, 2, 1],
  [2, 1, 2, 1, 2],
  [0, 1, 0, 1, 0],
  [3, 2, 3, 2, 3],
] as const;

export function getSymbolsOnPayline(
  matrix: readonly (readonly string[])[],
  payline: Payline,
): string[] {
  if (payline.length !== matrix.length) {
    throw new Error('Payline length must match matrix column count');
  }

  const symbols: string[] = [];

  for (let reelIndex = 0; reelIndex < payline.length; reelIndex++) {
    const rowIndex = payline[reelIndex];
    const reel = matrix[reelIndex];

    if (rowIndex === undefined) {
      throw new Error(`Payline row index at ${reelIndex} is undefined`);
    }

    if (reel === undefined) {
      throw new Error(`Reel at index ${reelIndex} is undefined`);
    }

    const symbol = reel[rowIndex];

    if (symbol === undefined) {
      throw new Error(`Symbol at [${reelIndex}][${rowIndex}] is undefined`);
    }

    symbols.push(symbol);
  }

  return symbols;
}
