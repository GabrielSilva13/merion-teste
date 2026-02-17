import { describe, it, expect, vi } from 'vitest';
import { GameState } from './game-state';
import type { GameStateObserver } from './game-state';

describe('GameState', () => {
  it('should initialize with correct values', () => {
    const state = new GameState(1000, 50);

    expect(state.getBalance()).toBe(1000);
    expect(state.getBet()).toBe(50);
    expect(state.getState()).toBe('idle');
  });

  it('should update balance correctly', () => {
    const state = new GameState(1000, 50);

    state.updateBalance(100);
    expect(state.getBalance()).toBe(1100);

    state.updateBalance(-200);
    expect(state.getBalance()).toBe(900);
  });

  it('should increase balance correctly', () => {
    const state = new GameState(1000, 50);

    state.increaseBalance(100);
    expect(state.getBalance()).toBe(1100);

    state.increaseBalance(50);
    expect(state.getBalance()).toBe(1150);
  });

  it('should not allow negative increase', () => {
    const state = new GameState(1000, 50);

    expect(() => state.increaseBalance(-100)).toThrow('Amount must be positive');
  });

  it('should decrease balance correctly', () => {
    const state = new GameState(1000, 50);

    state.decreaseBalance(100);
    expect(state.getBalance()).toBe(900);

    state.decreaseBalance(50);
    expect(state.getBalance()).toBe(850);
  });

  it('should not allow negative decrease', () => {
    const state = new GameState(1000, 50);

    expect(() => state.decreaseBalance(-100)).toThrow('Amount must be positive');
  });

  it('should not allow decrease more than balance', () => {
    const state = new GameState(100, 50);

    expect(() => state.decreaseBalance(200)).toThrow('Insufficient balance');
  });

  it('should set balance with validation', () => {
    const state = new GameState(1000, 50);

    state.setBalance(500);
    expect(state.getBalance()).toBe(500);

    expect(() => state.setBalance(-100)).toThrow('Balance cannot be negative');
  });

  it('should set bet with validation', () => {
    const state = new GameState(1000, 50);

    state.setBet(100);
    expect(state.getBet()).toBe(100);

    expect(() => state.setBet(0)).toThrow('Bet must be greater than zero');
    expect(() => state.setBet(-50)).toThrow('Bet must be greater than zero');
    expect(() => state.setBet(2000)).toThrow('Bet cannot exceed balance');
  });

  it('should transition through valid states', () => {
    const state = new GameState(1000, 50);

    expect(state.setState('spinning')).toBe(true);
    expect(state.getState()).toBe('spinning');

    expect(state.setState('evaluating')).toBe(true);
    expect(state.getState()).toBe('evaluating');

    expect(state.setState('showingWin')).toBe(true);
    expect(state.getState()).toBe('showingWin');

    expect(state.setState('idle')).toBe(true);
    expect(state.getState()).toBe('idle');
  });

  it('should reject invalid state transitions', () => {
    const state = new GameState(1000, 50);

    expect(() => state.setState('evaluating')).toThrow('Invalid transition');
    expect(state.getState()).toBe('idle');

    state.setState('spinning');
    expect(() => state.setState('idle')).toThrow('Invalid transition');
    expect(state.getState()).toBe('spinning');
  });

  it('should allow placing bet when in idle state with sufficient balance', () => {
    const state = new GameState(1000, 50);

    expect(state.canPlaceBet()).toBe(true);
    state.deductBet();
    expect(state.getBalance()).toBe(950);
  });

  it('should not allow placing bet in non-idle state', () => {
    const state = new GameState(1000, 50);

    state.setState('spinning');
    expect(state.canPlaceBet()).toBe(false);
    expect(() => state.deductBet()).toThrow('Cannot place bet in current state');
  });

  it('should not allow placing bet with insufficient balance', () => {
    const state = new GameState(30, 50);

    expect(state.canPlaceBet()).toBe(false);
  });

  it('should notify observers on balance change', () => {
    const state = new GameState(1000, 50);
    const observer: GameStateObserver = {
      onBalanceChange: vi.fn(),
    };

    state.subscribe(observer);
    state.updateBalance(100);

    expect(observer.onBalanceChange).toHaveBeenCalledWith(1100);
  });

  it('should notify observers on bet change', () => {
    const state = new GameState(1000, 50);
    const observer: GameStateObserver = {
      onBetChange: vi.fn(),
    };

    state.subscribe(observer);
    state.setBet(75);

    expect(observer.onBetChange).toHaveBeenCalledWith(75);
  });

  it('should notify observers on state change', () => {
    const state = new GameState(1000, 50);
    const observer: GameStateObserver = {
      onStateChange: vi.fn(),
    };

    state.subscribe(observer);
    state.setState('spinning');

    expect(observer.onStateChange).toHaveBeenCalledWith('spinning');
  });

  it('should return correct game data snapshot', () => {
    const state = new GameState(1000, 50);

    const data = state.getData();

    expect(data).toEqual({
      balance: 1000,
      bet: 50,
      currentState: 'idle',
    });
  });
});
