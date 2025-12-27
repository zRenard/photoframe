/**
 * Application constants
 */

// Position constants for UI elements
export const POSITIONS = Object.freeze([
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right', 
  'bottom-left', 'bottom-center', 'bottom-right'
]);

// Size constants for UI elements
export const SIZES = Object.freeze([
  'size-1', 'size-2', 'size-3', 'size-4', 'size-5'
]);

// Transition effect constants
export const TRANSITIONS = Object.freeze([
  'fade', 'slide-right', 'slide-left', 'slide-up', 'slide-down'
]);

// Display mode constants for images
export const DISPLAY_MODES = Object.freeze([
  'original', 'adjust', 'fit'
]);

// Time format constants
export const TIME_FORMATS = Object.freeze([
  '12h', '24h'
]);

// Date format constants
export const DATE_FORMATS = Object.freeze([
  'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'
]);

// Language constants
export const LANGUAGES = Object.freeze([
  'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'ja', 'ko'
]);

// Theme constants
export const THEMES = Object.freeze([
  'light', 'dark', 'auto'
]);

// Default values
export const DEFAULT_VALUES = Object.freeze({
  ROTATION_TIME: 10,
  TRANSITION_DURATION: 1000,
  POSITION: 'top-right',
  SIZE: 'size-2',
  DISPLAY_MODE: 'adjust',
  TIME_FORMAT: '24h',
  DATE_FORMAT: 'DD/MM/YYYY',
  LANGUAGE: 'en',
  THEME: 'dark',
  TRANSITION: 'fade'
});

// Weather constants
export const WEATHER_CONSTANTS = Object.freeze({
  UNITS: ['metric', 'imperial'],
  FORECAST_MODES: ['today', 'tomorrow', 'smart'],
  REFRESH_INTERVALS: [30, 60, 120, 300, 600]
});

// Timer constants
export const TIMER_CONSTANTS = Object.freeze({
  MODES: ['countdown', 'chronometer'],
  MIN_DURATION: 1,
  MAX_DURATION: 86400, // 24 hours in seconds
  DEFAULT_DURATION: 300 // 5 minutes
});

// Export all constants as a single object for convenience
export default Object.freeze({
  POSITIONS,
  SIZES,
  TRANSITIONS,
  DISPLAY_MODES,
  TIME_FORMATS,
  DATE_FORMATS,
  LANGUAGES,
  THEMES,
  DEFAULT_VALUES,
  WEATHER_CONSTANTS,
  TIMER_CONSTANTS
});
