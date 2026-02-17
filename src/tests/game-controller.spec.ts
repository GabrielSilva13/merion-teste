import { GameController } from '@application/game-controller';
import { SeededRNG } from '@domain/rng';
import { createDeterministicSlotMachine } from '@domain/slot-machine-factory';
import type { SymbolId } from '@domain/types';
import { FakeSlotApi } from '@infrastructure/fake-slot-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('GameController', () => {
  function createTestController(balance = 1000, bet = 10) {
    const slotMachine = createDeterministicSlotMachine(12345);
    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
      minLatency: 100,
      maxLatency: 200,
    });

    return new GameController({
      api,
      initialBalance: balance,
      initialBet: bet,
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should not allow spin with insufficient balance', async () => {
    const controller = createTestController(5, 10);

    const spinPromise = controller.spin();
    vi.runAllTimers();
    const result = await spinPromise;

    expect(result).toBeNull();
    expect(controller.getBalance()).toBe(5);
  });

  it('should reduce balance after spin', async () => {
    const controller = createTestController(100, 10);

    const spinPromise = controller.spin();
    vi.runAllTimers();
    await spinPromise;

    expect(controller.getBalance()).toBeLessThan(100);
  });

  it('should increase balance when there is a win', async () => {
    const reels = [
      ['SEVEN', 'ORANGE', 'GRAPE', 'BELL'] as SymbolId[],
      ['SEVEN', 'ORANGE', 'BAR', 'GRAPE'] as SymbolId[],
      ['SEVEN', 'BELL', 'BAR', 'DIAMOND'] as SymbolId[],
      ['SEVEN', 'WILD', 'ORANGE', 'GRAPE'] as SymbolId[],
      ['SEVEN', 'ORANGE', 'BAR', 'GRAPE'] as SymbolId[],
    ];

    const slotMachine = createDeterministicSlotMachine(12345);

    const mockSpin = vi.spyOn(slotMachine, 'spin').mockReturnValue({
      matrix: reels,
      wins: [
        {
          paylineIndex: 0,
          symbolId: 'SEVEN',
          count: 5,
          payout: 300,
        },
      ],
      totalWin: 300,
      reels: [
        { reelIndex: 0, startIndex: 0 },
        { reelIndex: 1, startIndex: 0 },
        { reelIndex: 2, startIndex: 0 },
        { reelIndex: 3, startIndex: 0 },
        { reelIndex: 4, startIndex: 0 },
      ],
    });

    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
      minLatency: 50,
      maxLatency: 100,
    });

    const controller = new GameController({
      api,
      initialBalance: 100,
      initialBet: 10,
    });

    const spinPromise = controller.spin();
    vi.runAllTimers();
    const result = await spinPromise;

    expect(result).not.toBeNull();
    expect(result?.totalWin).toBe(300);
    expect(controller.getBalance()).toBe(390);

    mockSpin.mockRestore();
  });

  it('should not allow double spin', async () => {
    const controller = createTestController(1000, 10);

    const spin1Promise = controller.spin();
    const spin2Promise = controller.spin();

    vi.runAllTimers();

    const result1 = await spin1Promise;
    const result2 = await spin2Promise;

    expect(result1).not.toBeNull();
    expect(result2).toBeNull();
  });

  it('should transition through correct states during spin', async () => {
    const controller = createTestController(1000, 10);
    const stateChanges: string[] = [];

    controller.getState().subscribe({
      onStateChange: (state) => {
        stateChanges.push(state);
      },
    });

    expect(controller.getStatus()).toBe('idle');

    const spinPromise = controller.spin();

    await vi.advanceTimersByTimeAsync(0);
    expect(stateChanges[0]).toBe('spinning');

    await vi.runAllTimersAsync();
    await spinPromise;

    expect(stateChanges).toContain('evaluating');
    expect(['idle', 'showingWin']).toContain(stateChanges[stateChanges.length - 1]);
  });

  it('should wait for API latency', async () => {
    const controller = createTestController(1000, 10);

    let resolved = false;
    const spinPromise = controller.spin();

    spinPromise.then(() => {
      resolved = true;
    });

    vi.advanceTimersByTime(50);
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(150);
    await spinPromise;

    expect(resolved).toBe(true);
  });

  it('should allow changing bet when idle', () => {
    const controller = createTestController(1000, 10);

    expect(controller.getBet()).toBe(10);

    controller.setBet(20);
    expect(controller.getBet()).toBe(20);
  });

  it('should not allow bet greater than balance', () => {
    const controller = createTestController(50, 10);

    expect(() => controller.setBet(100)).toThrow('Bet cannot exceed balance');
    expect(controller.getBet()).toBe(10);
  });

  it('should allow finishing win presentation', async () => {
    const reels = [
      ['BELL', 'ORANGE', 'GRAPE', 'BAR'] as SymbolId[],
      ['BELL', 'ORANGE', 'BAR', 'GRAPE'] as SymbolId[],
      ['BELL', 'BELL', 'BAR', 'DIAMOND'] as SymbolId[],
      ['BELL', 'WILD', 'ORANGE', 'GRAPE'] as SymbolId[],
      ['BELL', 'ORANGE', 'BAR', 'GRAPE'] as SymbolId[],
    ];

    const slotMachine = createDeterministicSlotMachine(12345);

    const mockSpin = vi.spyOn(slotMachine, 'spin').mockReturnValue({
      matrix: reels,
      wins: [
        {
          paylineIndex: 0,
          symbolId: 'BELL',
          count: 5,
          payout: 150,
        },
      ],
      totalWin: 150,
      reels: [
        { reelIndex: 0, startIndex: 0 },
        { reelIndex: 1, startIndex: 0 },
        { reelIndex: 2, startIndex: 0 },
        { reelIndex: 3, startIndex: 0 },
        { reelIndex: 4, startIndex: 0 },
      ],
    });

    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
      minLatency: 50,
      maxLatency: 100,
    });

    const controller = new GameController({
      api,
      initialBalance: 100,
      initialBet: 10,
    });

    const spinPromise = controller.spin();
    vi.runAllTimers();
    await spinPromise;

    expect(controller.getStatus()).toBe('showingWin');

    controller.finishWinPresentation();
    expect(controller.getStatus()).toBe('idle');

    mockSpin.mockRestore();
  });

  it('should report canSpin correctly', () => {
    const controller = createTestController(100, 10);

    expect(controller.canSpin()).toBe(true);

    const spinPromise = controller.spin();
    expect(controller.canSpin()).toBe(false);

    vi.runAllTimers();
    spinPromise.then(() => {
      expect(controller.canSpin()).toBe(true);
    });
  });

  it('should handle spin with no wins correctly', async () => {
    const reels = [
      ['ORANGE', 'GRAPE', 'BELL', 'BAR'] as SymbolId[],
      ['GRAPE', 'ORANGE', 'BAR', 'DIAMOND'] as SymbolId[],
      ['BELL', 'SEVEN', 'DIAMOND', 'WILD'] as SymbolId[],
      ['BAR', 'WILD', 'ORANGE', 'GRAPE'] as SymbolId[],
      ['SEVEN', 'ORANGE', 'BAR', 'GRAPE'] as SymbolId[],
    ];

    const slotMachine = createDeterministicSlotMachine(12345);

    const mockSpin = vi.spyOn(slotMachine, 'spin').mockReturnValue({
      matrix: reels,
      wins: [],
      totalWin: 0,
      reels: [
        { reelIndex: 0, startIndex: 0 },
        { reelIndex: 1, startIndex: 0 },
        { reelIndex: 2, startIndex: 0 },
        { reelIndex: 3, startIndex: 0 },
        { reelIndex: 4, startIndex: 0 },
      ],
    });

    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
      minLatency: 50,
      maxLatency: 100,
    });

    const controller = new GameController({
      api,
      initialBalance: 100,
      initialBet: 10,
    });

    const spinPromise = controller.spin();
    vi.runAllTimers();
    const result = await spinPromise;

    expect(result?.totalWin).toBe(0);
    expect(controller.getBalance()).toBe(90);
    expect(controller.getStatus()).toBe('idle');

    mockSpin.mockRestore();
  });
});
