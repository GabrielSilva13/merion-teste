import { describe, it, expect, vi } from 'vitest';
import { FiniteStateMachine } from './fsm';
import type { FSMObserver } from './fsm';

type TestState = 'idle' | 'running' | 'paused' | 'stopped';

describe('FiniteStateMachine', () => {
  it('should initialize with the correct state', () => {
    const fsm = new FiniteStateMachine<TestState>('idle', {
      idle: ['running'],
      running: ['paused', 'stopped'],
      paused: ['running', 'stopped'],
      stopped: [],
    });

    expect(fsm.getState()).toBe('idle');
  });

  it('should allow valid transitions', () => {
    const fsm = new FiniteStateMachine<TestState>('idle', {
      idle: ['running'],
      running: ['paused', 'stopped'],
      paused: ['running', 'stopped'],
      stopped: [],
    });

    expect(fsm.canTransitionTo('running')).toBe(true);
    expect(fsm.transitionTo('running')).toBe(true);
    expect(fsm.getState()).toBe('running');
  });

  it('should reject invalid transitions', () => {
    const fsm = new FiniteStateMachine<TestState>('idle', {
      idle: ['running'],
      running: ['paused', 'stopped'],
      paused: ['running', 'stopped'],
      stopped: [],
    });

    expect(fsm.canTransitionTo('paused')).toBe(false);
    expect(() => fsm.transitionTo('paused')).toThrow('Invalid transition');
    expect(fsm.getState()).toBe('idle');
  });

  it('should notify observers on state change', () => {
    const fsm = new FiniteStateMachine<TestState>('idle', {
      idle: ['running'],
      running: ['paused'],
      paused: [],
      stopped: [],
    });

    const observer: FSMObserver<TestState> = {
      onStateChange: vi.fn(),
    };

    fsm.subscribe(observer);
    fsm.transitionTo('running');

    expect(observer.onStateChange).toHaveBeenCalledWith('idle', 'running');
    expect(observer.onStateChange).toHaveBeenCalledTimes(1);
  });

  it('should allow force transition to any state', () => {
    const fsm = new FiniteStateMachine<TestState>('idle', {
      idle: ['running'],
      running: ['paused'],
      paused: [],
      stopped: [],
    });

    fsm.forceTransition('stopped');
    expect(fsm.getState()).toBe('stopped');
  });

  it('should support multiple observers', () => {
    const fsm = new FiniteStateMachine<TestState>('idle', {
      idle: ['running'],
      running: [],
      paused: [],
      stopped: [],
    });

    const observer1: FSMObserver<TestState> = { onStateChange: vi.fn() };
    const observer2: FSMObserver<TestState> = { onStateChange: vi.fn() };

    fsm.subscribe(observer1);
    fsm.subscribe(observer2);
    fsm.transitionTo('running');

    expect(observer1.onStateChange).toHaveBeenCalledWith('idle', 'running');
    expect(observer2.onStateChange).toHaveBeenCalledWith('idle', 'running');
  });

  it('should allow unsubscribing observers', () => {
    const fsm = new FiniteStateMachine<TestState>('idle', {
      idle: ['running'],
      running: [],
      paused: [],
      stopped: [],
    });

    const observer: FSMObserver<TestState> = { onStateChange: vi.fn() };

    fsm.subscribe(observer);
    fsm.unsubscribe(observer);
    fsm.transitionTo('running');

    expect(observer.onStateChange).not.toHaveBeenCalled();
  });
});
