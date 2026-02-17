import { describe, it, expect } from 'vitest';
import { PAYLINES_10, getSymbolsOnPayline } from './paylines';

describe('PAYLINES_10', () => {
  it('should have exactly 10 paylines', () => {
    expect(PAYLINES_10).toHaveLength(10);
  });

  it('should have all paylines with 5 positions', () => {
    for (const payline of PAYLINES_10) {
      expect(payline).toHaveLength(5);
    }
  });

  it('should have valid row indices (0-3) for 5x4 grid', () => {
    for (const payline of PAYLINES_10) {
      for (const rowIndex of payline) {
        expect(rowIndex).toBeGreaterThanOrEqual(0);
        expect(rowIndex).toBeLessThanOrEqual(3);
      }
    }
  });

  it('should have first four paylines as straight lines', () => {
    expect(PAYLINES_10[0]).toEqual([0, 0, 0, 0, 0]);
    expect(PAYLINES_10[1]).toEqual([1, 1, 1, 1, 1]);
    expect(PAYLINES_10[2]).toEqual([2, 2, 2, 2, 2]);
    expect(PAYLINES_10[3]).toEqual([3, 3, 3, 3, 3]);
  });

  it('should have V-shaped paylines', () => {
    expect(PAYLINES_10[4]).toEqual([0, 1, 2, 1, 0]);
    expect(PAYLINES_10[5]).toEqual([2, 1, 0, 1, 2]);
  });
});

describe('getSymbolsOnPayline', () => {
  it('should extract symbols correctly from matrix', () => {
    const matrix = [
      ['A', 'B', 'C', 'D'],
      ['E', 'F', 'G', 'H'],
      ['I', 'J', 'K', 'L'],
      ['M', 'N', 'O', 'P'],
      ['Q', 'R', 'S', 'T'],
    ];

    const payline = [0, 0, 0, 0, 0];
    const symbols = getSymbolsOnPayline(matrix, payline);

    expect(symbols).toEqual(['A', 'E', 'I', 'M', 'Q']);
  });

  it('should extract symbols from diagonal payline', () => {
    const matrix = [
      ['A', 'B', 'C', 'D'],
      ['E', 'F', 'G', 'H'],
      ['I', 'J', 'K', 'L'],
      ['M', 'N', 'O', 'P'],
      ['Q', 'R', 'S', 'T'],
    ];

    const payline = [0, 1, 2, 1, 0];
    const symbols = getSymbolsOnPayline(matrix, payline);

    expect(symbols).toEqual(['A', 'F', 'K', 'N', 'Q']);
  });

  it('should extract symbols from bottom row', () => {
    const matrix = [
      ['A', 'B', 'C', 'D'],
      ['E', 'F', 'G', 'H'],
      ['I', 'J', 'K', 'L'],
      ['M', 'N', 'O', 'P'],
      ['Q', 'R', 'S', 'T'],
    ];

    const payline = [3, 3, 3, 3, 3];
    const symbols = getSymbolsOnPayline(matrix, payline);

    expect(symbols).toEqual(['D', 'H', 'L', 'P', 'T']);
  });

  it('should throw error if payline length does not match matrix columns', () => {
    const matrix = [
      ['A', 'B', 'C', 'D'],
      ['E', 'F', 'G', 'H'],
      ['I', 'J', 'K', 'L'],
    ];

    const payline = [0, 0, 0, 0, 0];

    expect(() => getSymbolsOnPayline(matrix, payline)).toThrow(
      'Payline length must match matrix column count',
    );
  });
});
