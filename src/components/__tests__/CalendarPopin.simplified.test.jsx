/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import CalendarPopin from '../CalendarPopin';

// Mock CSS imports
jest.mock('../CalendarPopin.css', () => ({}), { virtual: true });

describe('CalendarPopin Component', () => {
  const mockOnSelectDate = jest.fn();
  
  it('renders correctly with default props', () => {
    render(<CalendarPopin onSelectDate={mockOnSelectDate} />);
    
    // Check if the calendar container renders
    const calendarElement = document.querySelector('.calendar');
    expect(calendarElement).toBeTruthy();
  });
  
  it('has navigation buttons', () => {
    render(<CalendarPopin onSelectDate={mockOnSelectDate} />);
    
    // Get header and navigation buttons
    const prevButton = document.querySelector('.col-start');
    const nextButton = document.querySelector('.col-end');
    
    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
  });
  
  it('responds to navigation button clicks', () => {
    render(<CalendarPopin onSelectDate={mockOnSelectDate} />);
    
    // Get current month display
    const monthDisplay = document.querySelector('.col-center span');
    const initialMonth = monthDisplay.textContent;
    
    // Click next month button
    const nextButton = document.querySelector('.col-end');
    fireEvent.click(nextButton);
    
    // Month should have changed
    expect(monthDisplay.textContent).not.toBe(initialMonth);
  });
  
  it('displays day cells', () => {
    render(<CalendarPopin onSelectDate={mockOnSelectDate} />);
    
    // Get day cells
    const dayCells = document.querySelectorAll('.cell');
    
    // There should be multiple day cells (at least 28)
    expect(dayCells.length).toBeGreaterThan(27);
  });
  
  it('calls the onSelectDate callback when a day is clicked', () => {
    render(<CalendarPopin onSelectDate={mockOnSelectDate} />);
    
    // Find an enabled day cell (not disabled)
    const enabledDays = Array.from(document.querySelectorAll('.cell'))
      .filter(cell => !cell.classList.contains('disabled'));
    
    // Click on an enabled day
    fireEvent.click(enabledDays[0]);
    
    // Callback should be called
    expect(mockOnSelectDate).toHaveBeenCalledTimes(1);
  });
  
  it('applies selected class to the selected date', () => {
    // Use a specific date for testing
    const testDate = new Date(2025, 0, 15); // January 15, 2025
    
    render(<CalendarPopin initialDate={testDate} onSelectDate={mockOnSelectDate} />);
    
    // Find the selected day cell
    const selectedDay = document.querySelector('.selected');
    
    // The selected day should exist
    expect(selectedDay).toBeTruthy();
    
    // The selected day should contain the text "15"
    expect(selectedDay.textContent.trim()).toBe('15');
  });
});
