/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, test, expect } from '@jest/globals';
import { useTimer } from '../useTimer';

describe('useTimer hook - basic tests', () => {
  test('initializes with correct default values for countdown', () => {
    const { result } = renderHook(() => 
      useTimer(0, 5, 30, 'countdown', 10)
    );

    expect(result.current.timerTime).toEqual({
      hours: 0,
      minutes: 5,
      seconds: 30
    });
    expect(result.current.timerIsActive).toBe(false);
    expect(result.current.timerIsPaused).toBe(false);
    expect(result.current.timerIsComplete).toBe(false);
  });

  test('initializes with correct default values for chronometer', () => {
    const { result } = renderHook(() => 
      useTimer(0, 0, 0, 'chronometer', 10)
    );

    expect(result.current.timerTime).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    expect(result.current.timerIsActive).toBe(false);
    expect(result.current.timerIsPaused).toBe(false);
  });

  test('has expected methods', () => {
    const { result } = renderHook(() => 
      useTimer(0, 5, 30, 'countdown', 10)
    );

    expect(typeof result.current.startTimer).toBe('function');
    expect(typeof result.current.pauseTimer).toBe('function');
    expect(typeof result.current.resetTimer).toBe('function');
    expect(typeof result.current.toggleTimer).toBe('function');
    expect(typeof result.current.formatTimerTime).toBe('function');
  });
});
