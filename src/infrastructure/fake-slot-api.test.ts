import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FakeSlotApi } from './fake-slot-api';
import { createDeterministicSlotMachine } from '@domain/slot-machine-factory';
import { SeededRNG } from '@domain/rng';

describe('FakeSlotApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should create api with default latency settings', () => {
    const slotMachine = createDeterministicSlotMachine(12345);
    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
    });

    expect(api).toBeDefined();
  });

  it('should create api with custom latency settings', () => {
    const slotMachine = createDeterministicSlotMachine(12345);
    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
      minLatency: 500,
      maxLatency: 1000,
    });

    expect(api).toBeDefined();
  });

  it('should throw error if minLatency is negative', () => {
    const slotMachine = createDeterministicSlotMachine(12345);

    expect(
      () =>
        new FakeSlotApi({
          slotMachine,
          rng: new SeededRNG(99999),
          minLatency: -100,
          maxLatency: 500,
        }),
    ).toThrow('minLatency cannot be negative');
  });

  it('should throw error if maxLatency < minLatency', () => {
    const slotMachine = createDeterministicSlotMachine(12345);

    expect(
      () =>
        new FakeSlotApi({
          slotMachine,
          rng: new SeededRNG(99999),
          minLatency: 500,
          maxLatency: 300,
        }),
    ).toThrow('maxLatency must be >= minLatency');
  });

  it('should introduce latency before returning result', async () => {
    const slotMachine = createDeterministicSlotMachine(12345);
    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
      minLatency: 300,
      maxLatency: 800,
    });

    const spinPromise = api.spin(10);

    let isResolved = false;
    spinPromise.then(() => {
      isResolved = true;
    });

    await Promise.resolve();
    expect(isResolved).toBe(false);

    vi.advanceTimersByTime(200);
    await Promise.resolve();
    expect(isResolved).toBe(false);

    vi.advanceTimersByTime(700);
    await spinPromise;
    expect(isResolved).toBe(true);
  });

  it('should return valid SpinResult', async () => {
    const slotMachine = createDeterministicSlotMachine(42);
    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(123),
      minLatency: 100,
      maxLatency: 200,
    });

    const spinPromise = api.spin(10);
    vi.runAllTimers();
    const result = await spinPromise;

    expect(result).toBeDefined();
    expect(result.matrix).toBeDefined();
    expect(result.matrix).toHaveLength(5);
    expect(result.wins).toBeDefined();
    expect(result.totalWin).toBeGreaterThanOrEqual(0);
  });

  it('should use RNG for latency generation', async () => {
    const slotMachine = createDeterministicSlotMachine(12345);
    const rng1 = new SeededRNG(555);
    const rng2 = new SeededRNG(555);

    const api1 = new FakeSlotApi({
      slotMachine,
      rng: rng1,
      minLatency: 100,
      maxLatency: 200,
    });

    const api2 = new FakeSlotApi({
      slotMachine,
      rng: rng2,
      minLatency: 100,
      maxLatency: 200,
    });

    const start1 = Date.now();
    const promise1 = api1.spin(10);
    vi.runAllTimers();
    await promise1;
    const duration1 = Date.now() - start1;

    const start2 = Date.now();
    const promise2 = api2.spin(10);
    vi.runAllTimers();
    await promise2;
    const duration2 = Date.now() - start2;

    expect(duration1).toBe(duration2);
  });

  it('should handle multiple sequential spins', async () => {
    const slotMachine = createDeterministicSlotMachine(12345);
    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
      minLatency: 50,
      maxLatency: 100,
    });

    const result1Promise = api.spin(10);
    vi.runAllTimers();
    const result1 = await result1Promise;

    const result2Promise = api.spin(10);
    vi.runAllTimers();
    const result2 = await result2Promise;

    const result3Promise = api.spin(10);
    vi.runAllTimers();
    const result3 = await result3Promise;

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result3).toBeDefined();
  });

  it('should propagate bet to slot machine', async () => {
    const slotMachine = createDeterministicSlotMachine(12345);
    const spinSpy = vi.spyOn(slotMachine, 'spin');

    const api = new FakeSlotApi({
      slotMachine,
      rng: new SeededRNG(99999),
      minLatency: 50,
      maxLatency: 100,
    });

    const spinPromise = api.spin(25);
    vi.runAllTimers();
    await spinPromise;

    expect(spinSpy).toHaveBeenCalledWith(25);
  });
});
