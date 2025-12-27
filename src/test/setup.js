import '@testing-library/jest-dom';

// Global mocks for CSS and other file types
// These mocks will apply globally across all tests
jest.mock('../components/CalendarPopin.css', () => ({}), { virtual: true });

// Set up any global Jest configurations here
// Mock ResizeObserver which is not available in jsdom
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    // Intentionally empty for mock
  }
  unobserve() {
    // Intentionally empty for mock
  }
  disconnect() {
    // Intentionally empty for mock
  }
};
