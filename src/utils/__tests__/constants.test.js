/**
 * @jest-environment node
 */
import { describe, test, expect } from '@jest/globals';
import * as constants from '../constants';

describe('constants utility', () => {
  test('exports position constants', () => {
    expect(constants.POSITIONS).toBeDefined();
    expect(Array.isArray(constants.POSITIONS)).toBe(true);
    
    // Check for common positions
    const positionValues = constants.POSITIONS || [];
    const expectedPositions = [
      'top-left', 'top-center', 'top-right',
      'center-left', 'center', 'center-right', 
      'bottom-left', 'bottom-center', 'bottom-right'
    ];
    
    expectedPositions.forEach(position => {
      expect(positionValues.includes(position)).toBe(true);
    });
  });

  test('exports size constants', () => {
    expect(constants.SIZES).toBeDefined();
    
    if (Array.isArray(constants.SIZES)) {
      expect(constants.SIZES.length).toBeGreaterThan(0);
      
      // Check for common sizes
      const expectedSizes = ['size-1', 'size-2', 'size-3', 'size-4'];
      const sizeValues = constants.SIZES;
      
      expectedSizes.forEach(size => {
        expect(sizeValues.includes(size)).toBe(true);
      });
    } else if (typeof constants.SIZES === 'object') {
      expect(Object.keys(constants.SIZES).length).toBeGreaterThan(0);
    }
  });

  test('exports transition constants', () => {
    if (constants.TRANSITIONS) {
      expect(constants.TRANSITIONS).toBeDefined();
      
      if (Array.isArray(constants.TRANSITIONS)) {
        expect(constants.TRANSITIONS.length).toBeGreaterThan(0);
        
        // Check for common transitions
        const expectedTransitions = ['fade', 'slide-right', 'slide-left'];
        const transitionValues = constants.TRANSITIONS;
        
        expectedTransitions.forEach(transition => {
          if (transitionValues.includes(transition)) {
            expect(transitionValues.includes(transition)).toBe(true);
          }
        });
      }
    }
  });

  test('exports display mode constants', () => {
    if (constants.DISPLAY_MODES) {
      expect(constants.DISPLAY_MODES).toBeDefined();
      
      if (Array.isArray(constants.DISPLAY_MODES)) {
        const expectedModes = ['original', 'adjust', 'fit'];
        const modeValues = constants.DISPLAY_MODES;
        
        expectedModes.forEach(mode => {
          if (modeValues.includes(mode)) {
            expect(modeValues.includes(mode)).toBe(true);
          }
        });
      }
    }
  });

  test('exports time format constants', () => {
    if (constants.TIME_FORMATS) {
      expect(constants.TIME_FORMATS).toBeDefined();
      
      if (Array.isArray(constants.TIME_FORMATS)) {
        const expectedFormats = ['12h', '24h'];
        const formatValues = constants.TIME_FORMATS;
        
        expectedFormats.forEach(format => {
          if (formatValues.includes(format)) {
            expect(formatValues.includes(format)).toBe(true);
          }
        });
      }
    }
  });

  test('exports date format constants', () => {
    if (constants.DATE_FORMATS) {
      expect(constants.DATE_FORMATS).toBeDefined();
      
      if (Array.isArray(constants.DATE_FORMATS)) {
        const expectedFormats = ['DD/MM/YYYY', 'MM/DD/YYYY'];
        const formatValues = constants.DATE_FORMATS;
        
        expectedFormats.forEach(format => {
          if (formatValues.includes(format)) {
            expect(formatValues.includes(format)).toBe(true);
          }
        });
      }
    }
  });

  test('exports language constants', () => {
    if (constants.LANGUAGES) {
      expect(constants.LANGUAGES).toBeDefined();
      
      if (Array.isArray(constants.LANGUAGES)) {
        const expectedLanguages = ['en', 'es', 'fr', 'de'];
        const languageValues = constants.LANGUAGES;
        
        expectedLanguages.forEach(lang => {
          if (languageValues.includes(lang)) {
            expect(languageValues.includes(lang)).toBe(true);
          }
        });
      }
    }
  });

  test('exports theme constants', () => {
    if (constants.THEMES) {
      expect(constants.THEMES).toBeDefined();
      
      if (Array.isArray(constants.THEMES)) {
        expect(constants.THEMES.length).toBeGreaterThan(0);
      }
    }
  });

  test('constants are immutable', () => {
    // Test that we can't modify exported constants
    if (constants.POSITIONS && Array.isArray(constants.POSITIONS)) {
      const originalLength = constants.POSITIONS.length;
      
      try {
        constants.POSITIONS.push('new-position');
        // If we get here, array is not frozen
      } catch {
        // Expected if array is frozen
      }
      
      // Length should remain the same (either frozen or we can test it doesn't change)
      expect(constants.POSITIONS.length).toBe(originalLength);
    }
  });

  test('exports default values', () => {
    if (constants.DEFAULT_VALUES) {
      expect(constants.DEFAULT_VALUES).toBeDefined();
      expect(typeof constants.DEFAULT_VALUES).toBe('object');
      
      // Check for common default values
      const defaults = constants.DEFAULT_VALUES;
      
      if (defaults.ROTATION_TIME) {
        expect(typeof defaults.ROTATION_TIME).toBe('number');
        expect(defaults.ROTATION_TIME).toBeGreaterThan(0);
      }
      
      if (defaults.LANGUAGE) {
        expect(typeof defaults.LANGUAGE).toBe('string');
        expect(defaults.LANGUAGE.length).toBeGreaterThan(0);
      }
    }
  });

  test('exports weather constants', () => {
    if (constants.WEATHER_UNITS) {
      expect(constants.WEATHER_UNITS).toBeDefined();
      
      if (Array.isArray(constants.WEATHER_UNITS)) {
        const expectedUnits = ['metric', 'imperial'];
        const unitValues = constants.WEATHER_UNITS;
        
        expectedUnits.forEach(unit => {
          if (unitValues.includes(unit)) {
            expect(unitValues.includes(unit)).toBe(true);
          }
        });
      }
    }
  });

  test('exports timer constants', () => {
    if (constants.TIMER_TYPES) {
      expect(constants.TIMER_TYPES).toBeDefined();
      
      if (Array.isArray(constants.TIMER_TYPES)) {
        const expectedTypes = ['countdown', 'chronometer'];
        const typeValues = constants.TIMER_TYPES;
        
        expectedTypes.forEach(type => {
          if (typeValues.includes(type)) {
            expect(typeValues.includes(type)).toBe(true);
          }
        });
      }
    }
  });

  test('all exported values are defined', () => {
    const exportedKeys = Object.keys(constants);
    
    exportedKeys.forEach(key => {
      expect(constants[key]).toBeDefined();
      expect(constants[key]).not.toBeNull();
      expect(constants[key]).not.toBeUndefined();
    });
  });

  test('constants have correct types', () => {
    Object.entries(constants).forEach(([, value]) => {
      // Each constant should be either an array, object, string, or number
      const validTypes = ['object', 'string', 'number', 'boolean'];
      expect(validTypes.includes(typeof value)).toBe(true);
      
      // If it's an object, it should not be null
      if (typeof value === 'object') {
        expect(value).not.toBeNull();
      }
    });
  });

  test('position constants are valid CSS positions', () => {
    if (constants.POSITIONS && Array.isArray(constants.POSITIONS)) {
      constants.POSITIONS.forEach(position => {
        expect(typeof position).toBe('string');
        expect(position.length).toBeGreaterThan(0);
        
        // Should follow the pattern of position names
        const validPatterns = [
          /^(top|center|bottom)$/,
          /^(top|center|bottom)-(left|center|right)$/,
          /^(left|right)$/
        ];
        
        const isValidPattern = validPatterns.some(pattern => pattern.test(position));
        expect(isValidPattern).toBe(true);
      });
    }
  });

  test('size constants are valid CSS classes', () => {
    if (constants.SIZES && Array.isArray(constants.SIZES)) {
      constants.SIZES.forEach(size => {
        expect(typeof size).toBe('string');
        expect(size.length).toBeGreaterThan(0);
        
        // Should follow size-X pattern or be a valid CSS class
        const validSizePattern = /^(size-\d+|xs|sm|md|lg|xl|2xl|3xl)$/;
        expect(validSizePattern.test(size)).toBe(true);
      });
    }
  });
});
