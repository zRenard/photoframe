/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, jest } from '@jest/globals';
import CalendarPopin from '../CalendarPopin';

describe('CalendarPopin Component', () => {
  test('renders without error', () => {
    // Mock CSS import
    jest.mock('../CalendarPopin.css', () => ({}), { virtual: true });
    
    // Simple render test
    const { container } = render(
      <CalendarPopin
        initialDate={new Date(2025, 5, 26)}
        onSelectDate={() => {}}
        firstDayOfWeek={0}
        language="en"
      />
    );
    
    expect(container).toBeTruthy();
  });
});
