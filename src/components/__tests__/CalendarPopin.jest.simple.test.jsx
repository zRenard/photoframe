/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect } from '@jest/globals';

// Direct component import
import CalendarPopin from '../CalendarPopin';

// Mock the CSS import
jest.mock('../CalendarPopin.css', () => ({}), { virtual: true });

describe('CalendarPopin Basic Tests', () => {
  test('renders a calendar with the correct month and year', () => {
    const testDate = new Date(2025, 5, 26); // June 26, 2025
    
    render(
      <CalendarPopin
        initialDate={testDate}
        onSelectDate={() => {}}
        firstDayOfWeek={0}
        language="en"
      />
    );
    
    // Check if the month and year are displayed
    expect(screen.getByText('June 2025')).toBeInTheDocument();
  });
  
  test('renders with different language (Spanish)', () => {
    const testDate = new Date(2025, 5, 26); // June 26, 2025
    
    render(
      <CalendarPopin
        initialDate={testDate}
        onSelectDate={() => {}}
        firstDayOfWeek={0}
        language="es"
      />
    );
    
    // Check if the month is displayed in Spanish
    expect(screen.getByText('junio 2025')).toBeInTheDocument();
  });
});
