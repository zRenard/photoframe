/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import TimerWrapper from '../TimerWrapper';

describe('TimerWrapper Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T12:30:45'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders without crashing when enabled', () => {
    render(
      <TimerWrapper
        showTime={true}
        timeDisplay={{
          position: 'top-left',
          size: 'size-1'
        }}
        timeFormat24h={true}
        showSeconds={true}
      />
    );

    expect(screen.getByText(/12:30:45/)).toBeInTheDocument();
  });

  test('does not render when disabled', () => {
    const { container } = render(
      <TimerWrapper
        showTime={false}
        timeDisplay={{
          position: 'top-left',
          size: 'size-1'
        }}
        timeFormat24h={true}
        showSeconds={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('displays time in 24-hour format', () => {
    render(
      <TimerWrapper
        showTime={true}
        timeDisplay={{
          position: 'center',
          size: 'size-2'
        }}
        timeFormat24h={true}
        showSeconds={false}
      />
    );

    expect(screen.getByText(/12:30/)).toBeInTheDocument();
  });
});
