/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect, beforeEach, afterEach } = pkg;
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from '../hooks/useSettings.js';
import defaultConfig from '../config/defaults.json';

describe('useSettings', () => {
  let localStorageMock;
  let getItemSpy;
  let setItemSpy;

  beforeEach(() => {
    // Create spies for localStorage methods
    getItemSpy = jest.fn(() => null);
    setItemSpy = jest.fn();
    
    // Mock localStorage on both global and window
    localStorageMock = {
      getItem: getItemSpy,
      setItem: setItemSpy,
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    
    global.localStorage = localStorageMock;
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Suppress console output for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default settings', () => {
      const { result } = renderHook(() => useSettings());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('object');
      expect(result.current.language).toBe(defaultConfig.language);
      expect(result.current.theme).toBe(defaultConfig.theme);
      expect(result.current.rotationTime).toBe(defaultConfig.rotationTime);
    });

    test('should initialize basic display settings', () => {
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.showDate).toBe(defaultConfig.dateDisplay.show);
      expect(result.current.showTime).toBe(defaultConfig.timeDisplay.show);
      expect(result.current.showImageCounter).toBe(defaultConfig.showImageCounter);
      expect(result.current.showCountdown).toBe(defaultConfig.showCountdown);
    });

    test('should initialize position settings with defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.countdownPosition).toBe(defaultConfig.countdownPosition ?? "bottom-left");
      expect(result.current.imageCounterPosition).toBe(defaultConfig.imageCounterPosition ?? "bottom-right");
      expect(result.current.uiControlsPosition).toBe(defaultConfig.uiControlsPosition ?? "top-right");
    });

    test('should initialize weather settings with defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.showWeather).toBe(defaultConfig.weather?.show ?? true);
      expect(result.current.weatherLocation).toBe(defaultConfig.weather?.location ?? "Nice, France");
      expect(result.current.forecastMode).toBe(defaultConfig.weather?.forecastMode ?? "smart");
      expect(result.current.weatherUnit).toBe(defaultConfig.weather?.unit ?? "metric");
    });

    test('should initialize timer settings with defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.timerEnabled).toBe(defaultConfig.timeDisplay?.timer?.enabled ?? false);
      expect(result.current.timerType).toBe(defaultConfig.timeDisplay?.timer?.type ?? 'countdown');
      expect(result.current.countdownMinutes).toBe(defaultConfig.timeDisplay?.timer?.countdownMinutes ?? 5);
    });

    test('should initialize calendar settings with defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.enableCalendar).toBe(defaultConfig.dateDisplay.enableCalendar);
      expect(result.current.firstDayOfWeek).toBe(defaultConfig.dateDisplay.firstDayOfWeek || 0);
      expect(result.current.calendarEvents).toEqual(defaultConfig.dateDisplay?.calendarEvents ?? []);
    });
  });

  describe('Settings Updates', () => {
    test('should update language setting', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setLanguage('fr');
      });
      
      expect(result.current.language).toBe('fr');
    });

    test('should update theme setting', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });

    test('should update rotation time', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setRotationTime(20);
      });
      
      expect(result.current.rotationTime).toBe(20);
    });

    test('should clamp rotation time to minimum value', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setRotationTime(5); // Below minimum
      });
      
      expect(result.current.rotationTime).toBe(10); // Should be clamped to 10
    });

    test('should clamp rotation time to maximum value', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setRotationTime(10000); // Above maximum
      });
      
      expect(result.current.rotationTime).toBe(7200); // Should be clamped to 7200
    });

    test('should update display visibility settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setShowDate(false);
        result.current.setShowTime(false);
        result.current.setShowImageCounter(true);
      });
      
      expect(result.current.showDate).toBe(false);
      expect(result.current.showTime).toBe(false);
      expect(result.current.showImageCounter).toBe(true);
    });

    test('should update time display settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setTimeFormat24h(false);
        result.current.setShowSeconds(true);
      });
      
      expect(result.current.timeFormat24h).toBe(false);
      expect(result.current.showSeconds).toBe(true);
    });

    test('should update time display position and size', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setTimeDisplay({ position: 'bottom-left', size: 'size-3' });
      });
      
      expect(result.current.timeDisplay.position).toBe('bottom-left');
      expect(result.current.timeDisplay.size).toBe('size-3');
    });

    test('should update date display settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setDateDisplay({ 
          position: 'top-left', 
          size: 'size-4',
          format: 'DD/MM/YYYY'
        });
      });
      
      expect(result.current.dateDisplay.position).toBe('top-left');
      expect(result.current.dateDisplay.size).toBe('size-4');
      expect(result.current.dateDisplay.format).toBe('DD/MM/YYYY');
    });

    test('should update weather settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setShowWeather(false);
        result.current.setWeatherLocation('Paris, France');
        result.current.setForecastMode('today');
        result.current.setWeatherUnit('imperial');
      });
      
      expect(result.current.showWeather).toBe(false);
      expect(result.current.weatherLocation).toBe('Paris, France');
      expect(result.current.forecastMode).toBe('today');
      expect(result.current.weatherUnit).toBe('imperial');
    });

    test('should update weather coordinates', () => {
      const { result } = renderHook(() => useSettings());
      
      const newCoords = { lat: 48.85, lon: 2.35 };
      act(() => {
        result.current.setWeatherCoordinates(newCoords);
      });
      
      expect(result.current.weatherCoordinates).toEqual(newCoords);
    });

    test('should update weather position and size', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setWeatherPosition('bottom-left');
        result.current.setWeatherSize('size-4');
      });
      
      expect(result.current.weatherPosition).toBe('bottom-left');
      expect(result.current.weatherSize).toBe('size-4');
    });

    test('should update timer settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setTimerEnabled(true);
        result.current.setTimerType('chronometer');
        result.current.setCountdownHours(1);
        result.current.setCountdownMinutes(30);
        result.current.setCountdownSeconds(45);
      });
      
      expect(result.current.timerEnabled).toBe(true);
      expect(result.current.timerType).toBe('chronometer');
      expect(result.current.countdownHours).toBe(1);
      expect(result.current.countdownMinutes).toBe(30);
      expect(result.current.countdownSeconds).toBe(45);
    });

    test('should update calendar settings', () => {
      const { result } = renderHook(() => useSettings());
      
      const events = [{ date: '2025-12-31', title: 'New Year' }];
      act(() => {
        result.current.setEnableCalendar(true);
        result.current.setFirstDayOfWeek(1);
        result.current.setCalendarEvents(events);
      });
      
      expect(result.current.enableCalendar).toBe(true);
      expect(result.current.firstDayOfWeek).toBe(1);
      expect(result.current.calendarEvents).toEqual(events);
    });

    test('should update position settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setCountdownPosition('top-left');
        result.current.setImageCounterPosition('top-right');
        result.current.setUiControlsPosition('bottom-right');
      });
      
      expect(result.current.countdownPosition).toBe('top-left');
      expect(result.current.imageCounterPosition).toBe('top-right');
      expect(result.current.uiControlsPosition).toBe('bottom-right');
    });

    test('should update slideshow settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setImageDisplayMode('contain');
        result.current.setSlideshowOrder('random');
      });
      
      expect(result.current.imageDisplayMode).toBe('contain');
      expect(result.current.slideshowOrder).toBe('random');
    });

    test('should update air quality and countdown settings', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setShowAirQuality(true);
        result.current.setShowWeatherCountdown(true);
        result.current.setWeatherRefreshInterval(120);
      });
      
      expect(result.current.showAirQuality).toBe(true);
      expect(result.current.showWeatherCountdown).toBe(true);
      expect(result.current.weatherRefreshInterval).toBe(120);
    });

    test('should update timer font sizes', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setCountdownFontSize('size-5');
        result.current.setChronometerFontSize('size-6');
        result.current.setTimerTimeoutBlinkDuration(15);
      });
      
      expect(result.current.countdownFontSize).toBe('size-5');
      expect(result.current.chronometerFontSize).toBe('size-6');
      expect(result.current.timerTimeoutBlinkDuration).toBe(15);
    });
  });

  describe('Save Settings', () => {
    test('should save settings to localStorage', async () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setLanguage('es');
        result.current.setTheme('dark');
      });
      
      act(() => {
        result.current.saveSettings();
      });
      
      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalled();
      });
      
      const calls = setItemSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      const savedData = JSON.parse(lastCall[1]);
      expect(savedData.language).toBe('es');
      expect(savedData.theme).toBe('dark');
    });

    test('should save complete settings structure', async () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setLanguage('fr');
        result.current.setRotationTime(30);
        result.current.setShowWeather(false);
      });
      
      act(() => {
        result.current.saveSettings();
      });
      
      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalled();
      });
      
      const calls = setItemSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      const savedData = JSON.parse(lastCall[1]);
      
      expect(savedData).toHaveProperty('language', 'fr');
      expect(savedData).toHaveProperty('rotationTime', 30);
      expect(savedData).toHaveProperty('weather');
      expect(savedData.weather).toHaveProperty('show', false);
      expect(savedData).toHaveProperty('timeDisplay');
      expect(savedData).toHaveProperty('dateDisplay');
    });

    test('should save weather settings correctly', async () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setWeatherLocation('London, UK');
        result.current.setWeatherUnit('imperial');
        result.current.setForecastMode('tomorrow');
      });
      
      act(() => {
        result.current.saveSettings();
      });
      
      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalled();
      });
      
      const calls = setItemSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      const savedData = JSON.parse(lastCall[1]);
      expect(savedData.weather.location).toBe('London, UK');
      expect(savedData.weather.unit).toBe('imperial');
      expect(savedData.weather.forecastMode).toBe('tomorrow');
    });

    test('should save timer settings correctly', async () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setTimerEnabled(true);
        result.current.setTimerType('countdown');
        result.current.setCountdownMinutes(10);
      });
      
      act(() => {
        result.current.saveSettings();
      });
      
      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalled();
      });
      
      const calls = setItemSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      const savedData = JSON.parse(lastCall[1]);
      expect(savedData.timeDisplay.timer.enabled).toBe(true);
      expect(savedData.timeDisplay.timer.type).toBe('countdown');
      expect(savedData.timeDisplay.timer.countdownMinutes).toBe(10);
    });
  });

  describe('Load Settings', () => {
    test('should load settings from localStorage on mount', () => {
      const savedSettings = {
        language: 'de',
        theme: 'dark',
        rotationTime: 25,
        weather: {
          show: false,
          location: 'Berlin, Germany',
          unit: 'metric'
        },
        timeDisplay: {
          show: false,
          format24h: true
        },
        dateDisplay: {
          show: true,
          format: 'YYYY-MM-DD'
        }
      };
      
      getItemSpy.mockReturnValueOnce(JSON.stringify(savedSettings));
      
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.language).toBe('de');
      expect(result.current.theme).toBe('dark');
      expect(result.current.rotationTime).toBe(25);
      expect(result.current.showWeather).toBe(false);
      expect(result.current.weatherLocation).toBe('Berlin, Germany');
      expect(result.current.showTime).toBe(false);
      expect(result.current.timeFormat24h).toBe(true);
    });

    test('should handle partial settings in localStorage', () => {
      const partialSettings = {
        language: 'it',
        weather: {
          location: 'Rome, Italy'
        }
      };
      
      getItemSpy.mockReturnValueOnce(JSON.stringify(partialSettings));
      
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.language).toBe('it');
      expect(result.current.weatherLocation).toBe('Rome, Italy');
      // Other settings should use defaults
      expect(result.current.theme).toBe(defaultConfig.theme);
    });

    test('should handle invalid JSON in localStorage gracefully', () => {
      getItemSpy.mockReturnValueOnce('invalid json');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useSettings());
      
      // Should fall back to defaults
      expect(result.current.language).toBe(defaultConfig.language);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('should handle null localStorage data', () => {
      getItemSpy.mockReturnValueOnce(null);
      
      const { result } = renderHook(() => useSettings());
      
      // Should use defaults
      expect(result.current.language).toBe(defaultConfig.language);
      expect(result.current.theme).toBe(defaultConfig.theme);
    });

    test('should load timer settings from localStorage', () => {
      const savedSettings = {
        timeDisplay: {
          timer: {
            enabled: true,
            type: 'chronometer',
            countdownHours: 2,
            countdownMinutes: 30,
            countdownSeconds: 15,
            timeoutBlinkDuration: 20
          }
        }
      };
      
      getItemSpy.mockReturnValueOnce(JSON.stringify(savedSettings));
      
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.timerEnabled).toBe(true);
      expect(result.current.timerType).toBe('chronometer');
      expect(result.current.countdownHours).toBe(2);
      expect(result.current.countdownMinutes).toBe(30);
      expect(result.current.countdownSeconds).toBe(15);
      expect(result.current.timerTimeoutBlinkDuration).toBe(20);
    });

    test('should load calendar settings from localStorage', () => {
      const events = [
        { date: '2025-12-25', title: 'Christmas' },
        { date: '2025-12-31', title: 'New Year' }
      ];
      
      const savedSettings = {
        dateDisplay: {
          enableCalendar: true,
          firstDayOfWeek: 1,
          calendarEvents: events
        }
      };
      
      getItemSpy.mockReturnValueOnce(JSON.stringify(savedSettings));
      
      const { result } = renderHook(() => useSettings());
      
      expect(result.current.enableCalendar).toBe(true);
      expect(result.current.firstDayOfWeek).toBe(1);
      expect(result.current.calendarEvents).toEqual(events);
    });
  });

  describe('Reset to Defaults', () => {
    test('should reset all settings to defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      // Change some settings
      act(() => {
        result.current.setLanguage('de');
        result.current.setTheme('dark');
        result.current.setRotationTime(60);
        result.current.setShowWeather(false);
        result.current.setTimerEnabled(true);
      });
      
      // Reset to defaults
      act(() => {
        result.current.resetToDefaults();
      });
      
      expect(result.current.language).toBe(defaultConfig.language);
      expect(result.current.theme).toBe(defaultConfig.theme);
      expect(result.current.rotationTime).toBe(defaultConfig.rotationTime);
      expect(result.current.showWeather).toBe(defaultConfig.weather?.show ?? true);
      expect(result.current.timerEnabled).toBe(defaultConfig.timeDisplay?.timer?.enabled ?? false);
    });

    test('should reset weather settings to defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setWeatherLocation('Custom City');
        result.current.setWeatherUnit('imperial');
        result.current.setForecastMode('tomorrow');
        result.current.resetToDefaults();
      });
      
      expect(result.current.weatherLocation).toBe(defaultConfig.weather?.location ?? "Nice, France");
      expect(result.current.weatherUnit).toBe(defaultConfig.weather?.unit ?? "metric");
      expect(result.current.forecastMode).toBe(defaultConfig.weather?.forecastMode ?? "smart");
    });

    test('should reset timer settings to defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setTimerEnabled(true);
        result.current.setTimerType('chronometer');
        result.current.setCountdownMinutes(30);
        result.current.resetToDefaults();
      });
      
      expect(result.current.timerEnabled).toBe(defaultConfig.timeDisplay?.timer?.enabled ?? false);
      expect(result.current.timerType).toBe(defaultConfig.timeDisplay?.timer?.type ?? 'countdown');
      expect(result.current.countdownMinutes).toBe(defaultConfig.timeDisplay?.timer?.countdownMinutes ?? 5);
    });

    test('should reset position settings to defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setCountdownPosition('top-right');
        result.current.setImageCounterPosition('bottom-left');
        result.current.setUiControlsPosition('top-left');
        result.current.resetToDefaults();
      });
      
      expect(result.current.countdownPosition).toBe(defaultConfig.countdownPosition ?? "bottom-left");
      expect(result.current.imageCounterPosition).toBe(defaultConfig.imageCounterPosition ?? "bottom-right");
      expect(result.current.uiControlsPosition).toBe(defaultConfig.uiControlsPosition ?? "top-right");
    });

    test('should reset display settings to defaults', () => {
      const { result } = renderHook(() => useSettings());
      
      act(() => {
        result.current.setTimeDisplay({ position: 'bottom-right', size: 'size-5' });
        result.current.setDateDisplay({ position: 'top-left', size: 'size-1', format: 'DD/MM/YY' });
        result.current.resetToDefaults();
      });
      
      expect(result.current.timeDisplay.position).toBe(defaultConfig.timeDisplay.position);
      expect(result.current.timeDisplay.size).toBe(defaultConfig.timeDisplay.size);
      expect(result.current.dateDisplay.position).toBe(defaultConfig.dateDisplay.position);
      expect(result.current.dateDisplay.size).toBe(defaultConfig.dateDisplay.size);
      expect(result.current.dateDisplay.format).toBe(defaultConfig.dateDisplay.format);
    });
  });
});
