/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect, beforeEach } = pkg;
import axios from 'axios';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchAirQuality,
  getWeatherByMode,
  getWeatherIconUrl,
  mapLanguageToApiCode,
  formatLocationInfo,
  getAirQualityDescription,
  isCoordinates,
  getEffectiveLocation
} from '../weatherService.js';
import defaultConfig from '../../config/defaults.json';

// Mock axios
jest.mock('axios');

describe('weatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('isCoordinates', () => {
    test('should return true for valid coordinate object', () => {
      expect(isCoordinates({ lat: 43.7, lon: 7.25 })).toBe(true);
    });

    test('should return false for non-object values', () => {
      expect(isCoordinates('Nice,France')).toBe(false);
      expect(isCoordinates(null)).toBe(false);
      expect(isCoordinates(undefined)).toBe(false);
      expect(isCoordinates(123)).toBe(false);
    });

    test('should return false for object without lat/lon', () => {
      expect(isCoordinates({ latitude: 43.7, longitude: 7.25 })).toBe(false);
      expect(isCoordinates({ lat: 43.7 })).toBe(false);
      expect(isCoordinates({ lon: 7.25 })).toBe(false);
    });
  });

  describe('mapLanguageToApiCode', () => {
    test('should map supported languages correctly', () => {
      expect(mapLanguageToApiCode('en')).toBe('en');
      expect(mapLanguageToApiCode('es')).toBe('es');
      expect(mapLanguageToApiCode('fr')).toBe('fr');
      expect(mapLanguageToApiCode('de')).toBe('de');
      expect(mapLanguageToApiCode('it')).toBe('it');
      expect(mapLanguageToApiCode('zh')).toBe('zh_cn');
      expect(mapLanguageToApiCode('ja')).toBe('ja');
    });

    test('should default to "en" for unsupported languages', () => {
      expect(mapLanguageToApiCode('xx')).toBe('en');
      expect(mapLanguageToApiCode('unknown')).toBe('en');
      expect(mapLanguageToApiCode('')).toBe('en');
    });
  });

  describe('getEffectiveLocation', () => {
    test('should return location string when valid', () => {
      expect(getEffectiveLocation('Paris,France', null)).toBe('Paris,France');
      expect(getEffectiveLocation('  London  ', null)).toBe('London');
    });

    test('should return coordinates when location is empty', () => {
      const coords = { lat: 43.7, lon: 7.25 };
      expect(getEffectiveLocation('', coords)).toEqual(coords);
      expect(getEffectiveLocation('  ', coords)).toEqual(coords);
      expect(getEffectiveLocation(null, coords)).toEqual(coords);
    });

    test('should return default location when both are invalid', () => {
      expect(getEffectiveLocation('', null)).toBe('Nice,France');
      expect(getEffectiveLocation(null, null)).toBe('Nice,France');
      expect(getEffectiveLocation('  ', { invalid: true })).toBe('Nice,France');
    });

    test('should validate coordinates object properly', () => {
      expect(getEffectiveLocation('', { lat: 'invalid', lon: 7.25 })).toBe('Nice,France');
      expect(getEffectiveLocation('', { lat: 43.7 })).toBe('Nice,France');
    });
  });

  describe('getWeatherIconUrl', () => {
    test('should return correct icon URL', () => {
      expect(getWeatherIconUrl('01d')).toBe('https://openweathermap.org/img/wn/01d@2x.png');
      expect(getWeatherIconUrl('10n')).toBe('https://openweathermap.org/img/wn/10n@2x.png');
    });
  });

  describe('formatLocationInfo', () => {
    test('should format complete location data correctly', () => {
      const weatherData = {
        name: 'Nice',
        sys: { country: 'FR' },
        coord: { lat: 43.7, lon: 7.25 }
      };
      
      const result = formatLocationInfo(weatherData);
      expect(result.name).toBe('Nice, FR');
      expect(result.coordinates).toBe('[43.70, 7.25]');
      expect(result.formattedString).toBe('Nice, FR [43.70, 7.25]');
      expect(result.lat).toBe(43.7);
      expect(result.lon).toBe(7.25);
    });

    test('should handle missing country', () => {
      const weatherData = {
        name: 'Nice',
        coord: { lat: 43.7, lon: 7.25 }
      };
      
      const result = formatLocationInfo(weatherData);
      expect(result.name).toBe('Nice');
      expect(result.coordinates).toBe('[43.70, 7.25]');
    });

    test('should handle missing coordinates', () => {
      const weatherData = {
        name: 'Nice',
        sys: { country: 'FR' }
      };
      
      const result = formatLocationInfo(weatherData);
      expect(result.name).toBe('Nice, FR');
      expect(result.coordinates).toBe('');
      expect(result.lat).toBeUndefined();
      expect(result.lon).toBeUndefined();
    });

    test('should handle null input', () => {
      expect(formatLocationInfo(null)).toBeNull();
      expect(formatLocationInfo(undefined)).toBeNull();
    });

    test('should handle missing name', () => {
      const weatherData = {
        sys: { country: 'FR' },
        coord: { lat: 43.7, lon: 7.25 }
      };
      
      const result = formatLocationInfo(weatherData);
      expect(result.name).toBe('Unknown location, FR');
    });
  });

  describe('getAirQualityDescription', () => {
    test('should return correct descriptions for all AQI levels', () => {
      expect(getAirQualityDescription(1).level).toBe('Good');
      expect(getAirQualityDescription(1).color).toBe('bg-green-500');
      
      expect(getAirQualityDescription(2).level).toBe('Fair');
      expect(getAirQualityDescription(2).color).toBe('bg-lime-500');
      
      expect(getAirQualityDescription(3).level).toBe('Moderate');
      expect(getAirQualityDescription(3).color).toBe('bg-yellow-500');
      
      expect(getAirQualityDescription(4).level).toBe('Poor');
      expect(getAirQualityDescription(4).color).toBe('bg-orange-500');
      
      expect(getAirQualityDescription(5).level).toBe('Very Poor');
      expect(getAirQualityDescription(5).color).toBe('bg-red-500');
    });

    test('should handle unknown AQI values', () => {
      expect(getAirQualityDescription(0).level).toBe('Unknown');
      expect(getAirQualityDescription(0).color).toBe('bg-gray-500');
      expect(getAirQualityDescription(99).level).toBe('Unknown');
    });

    test('should use translations when provided', () => {
      const translations = {
        fr: {
          airQualityLevels: {
            good: 'Bon',
            poor: 'Mauvais'
          }
        }
      };
      
      expect(getAirQualityDescription(1, 'fr', translations).level).toBe('Bon');
      expect(getAirQualityDescription(4, 'fr', translations).level).toBe('Mauvais');
    });

    test('should fallback to English when translation is missing', () => {
      const translations = { fr: { airQualityLevels: {} } };
      expect(getAirQualityDescription(1, 'fr', translations).level).toBe('Good');
    });
  });

  describe('fetchCurrentWeather', () => {
    test('should fetch weather by city name', async () => {
      const mockData = {
        name: 'Paris',
        main: { temp: 20 },
        weather: [{ description: 'clear' }]
      };
      
      axios.get.mockResolvedValue({ data: mockData });
      
      const result = await fetchCurrentWeather('Paris,France');
      
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'Paris,France',
            units: 'metric',
            lang: 'en'
          })
        })
      );
      expect(result).toEqual(mockData);
    });

    test('should fetch weather by coordinates', async () => {
      const mockData = {
        name: 'Paris',
        main: { temp: 20 }
      };
      
      axios.get.mockResolvedValue({ data: mockData });
      
      const coords = { lat: 48.85, lon: 2.35 };
      const result = await fetchCurrentWeather(coords);
      
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        expect.objectContaining({
          params: expect.objectContaining({
            lat: 48.85,
            lon: 2.35,
            units: 'metric',
            lang: 'en'
          })
        })
      );
      expect(result).toEqual(mockData);
    });

    test('should use custom API key when provided', async () => {
      axios.get.mockResolvedValue({ data: {} });
      
      await fetchCurrentWeather('Paris', 'metric', 'en', 'custom-key');
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            appid: 'custom-key'
          })
        })
      );
    });

    test('should handle errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      
      const result = await fetchCurrentWeather('InvalidCity');
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('fetchForecast', () => {
    test('should fetch forecast by city name', async () => {
      const mockData = {
        city: { 
          name: 'Paris', 
          country: 'FR',
          coord: { lat: 48.85, lon: 2.35 }
        },
        list: [{
          dt: Math.floor(Date.now() / 1000) + 86400 + 43200, // Tomorrow at noon
          main: { temp: 22 }
        }]
      };
      
      axios.get.mockResolvedValue({ data: mockData });
      
      const result = await fetchForecast('Paris,France');
      
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/forecast',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'Paris,France'
          })
        })
      );
      expect(result.name).toBe('Paris');
      expect(result.sys.country).toBe('FR');
      expect(result.coord).toEqual({ lat: 48.85, lon: 2.35 });
    });

    test('should fetch forecast by coordinates', async () => {
      const mockData = {
        city: { 
          name: 'Paris', 
          country: 'FR',
          coord: { lat: 48.85, lon: 2.35 }
        },
        list: [{
          dt: Math.floor(Date.now() / 1000),
          main: { temp: 22 }
        }]
      };
      
      axios.get.mockResolvedValue({ data: mockData });
      
      const coords = { lat: 48.85, lon: 2.35 };
      const result = await fetchForecast(coords);
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            lat: 48.85,
            lon: 2.35
          })
        })
      );
    });

    test('should handle errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('API error'));
      
      const result = await fetchForecast('InvalidCity');
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('fetchAirQuality', () => {
    test('should fetch air quality data', async () => {
      const mockData = {
        list: [{
          main: { aqi: 1 },
          components: { pm2_5: 10 }
        }]
      };
      
      axios.get.mockResolvedValue({ data: mockData });
      
      const result = await fetchAirQuality(43.7, 7.25);
      
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/air_pollution',
        expect.objectContaining({
          params: expect.objectContaining({
            lat: 43.7,
            lon: 7.25
          })
        })
      );
      expect(result).toEqual(mockData.list[0]);
    });

    test('should use custom API key when provided', async () => {
      const mockData = { list: [{ main: { aqi: 1 } }] };
      axios.get.mockResolvedValue({ data: mockData });
      
      await fetchAirQuality(43.7, 7.25, 'custom-key');
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            appid: 'custom-key'
          })
        })
      );
    });

    test('should return null when no data available', async () => {
      axios.get.mockResolvedValue({ data: { list: [] } });
      
      const result = await fetchAirQuality(43.7, 7.25);
      
      expect(result).toBeNull();
    });

    test('should handle errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      
      const result = await fetchAirQuality(43.7, 7.25);
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getWeatherByMode', () => {
    beforeEach(() => {
      // Mock current time to 10:00 AM for predictable tests
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
    });

    test('should fetch current weather in "today" mode', async () => {
      const mockCurrent = { name: 'Paris', main: { temp: 20 } };
      axios.get.mockResolvedValue({ data: mockCurrent });
      
      const result = await getWeatherByMode('Paris', 'today');
      
      expect(result.current).toEqual(mockCurrent);
      expect(result.forecast).toBeNull();
    });

    test('should fetch forecast in "tomorrow" mode', async () => {
      const mockForecast = {
        city: { name: 'Paris', country: 'FR', coord: { lat: 48, lon: 2 } },
        list: [{ dt: Math.floor(Date.now() / 1000), main: { temp: 22 } }]
      };
      axios.get.mockResolvedValue({ data: mockForecast });
      
      const result = await getWeatherByMode('Paris', 'tomorrow');
      
      expect(result.current).toBeNull();
      expect(result.forecast).toBeDefined();
      expect(result.forecast.name).toBe('Paris');
    });

    test('should use coordinates when location is empty', async () => {
      const mockCurrent = { name: 'Nice', main: { temp: 25 } };
      axios.get.mockResolvedValue({ data: mockCurrent });
      
      const coords = { lat: 43.7, lon: 7.25 };
      await getWeatherByMode('', 'today', 'metric', 'en', null, null, coords);
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            lat: 43.7,
            lon: 7.25
          })
        })
      );
    });

    test('should handle smart mode before noon', async () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
      const mockCurrent = { name: 'Paris', main: { temp: 20 } };
      const mockForecast = {
        city: { name: 'Paris', country: 'FR', coord: { lat: 48, lon: 2 } },
        list: [{ dt: Math.floor(Date.now() / 1000), main: { temp: 22 } }]
      };
      
      let callCount = 0;
      axios.get.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ 
          data: callCount === 1 ? mockCurrent : mockForecast 
        });
      });
      
      const result = await getWeatherByMode('Paris', 'smart');
      
      expect(result.current).toEqual(mockCurrent);
      expect(result.forecast).toBeNull();
    });

    test('should handle smart mode after noon', async () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);
      const mockCurrent = { name: 'Paris', main: { temp: 20 } };
      const mockForecast = {
        city: { name: 'Paris', country: 'FR', coord: { lat: 48, lon: 2 } },
        list: [{ dt: Math.floor(Date.now() / 1000), main: { temp: 22 } }]
      };
      
      let callCount = 0;
      axios.get.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ 
          data: callCount === 1 ? mockCurrent : mockForecast 
        });
      });
      
      const result = await getWeatherByMode('Paris', 'smart');
      
      expect(result.current).toBeNull();
      expect(result.forecast).toBeDefined();
    });
  });

  describe('Debug logging', () => {
    let originalDebug;

    beforeEach(() => {
      originalDebug = defaultConfig.debug;
    });

    afterEach(() => {
      defaultConfig.debug = originalDebug;
    });

    test('should log debug messages when debug is enabled', async () => {
      defaultConfig.debug = true;
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const mockCurrent = { name: 'Paris', main: { temp: 20 } };
      axios.get.mockResolvedValue({ data: mockCurrent });

      await fetchCurrentWeather('Paris,France');

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    test('should log debug info for coordinates fetch', async () => {
      defaultConfig.debug = true;
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const mockCurrent = { name: 'Paris', main: { temp: 20 } };
      axios.get.mockResolvedValue({ data: mockCurrent });

      await fetchCurrentWeather({ lat: 48.85, lon: 2.35 });

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    test('should log debug info for tomorrow forecast', async () => {
      defaultConfig.debug = true;
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const mockCurrent = { name: 'Paris', main: { temp: 20 } };
      const mockForecast = {
        city: { name: 'Paris', country: 'FR', coord: { lat: 48, lon: 2 } },
        list: [{ dt: Math.floor(Date.now() / 1000), main: { temp: 22 } }]
      };

      let callCount = 0;
      axios.get.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ 
          data: callCount === 1 ? mockCurrent : mockForecast 
        });
      });

      await getWeatherByMode('Paris', 'tomorrow');

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    test('should log debug info for smart mode after noon with forecast', async () => {
      defaultConfig.debug = true;
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const mockCurrent = { name: 'Paris', main: { temp: 20 } };
      const mockForecast = {
        city: { name: 'Paris', country: 'FR', coord: { lat: 48, lon: 2 } },
        list: [{ dt: Math.floor(Date.now() / 1000), main: { temp: 22 } }]
      };

      let callCount = 0;
      axios.get.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ 
          data: callCount === 1 ? mockCurrent : mockForecast 
        });
      });

      await getWeatherByMode('Paris', 'smart');

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    test('should log debug info in formatLocationInfo', () => {
      defaultConfig.debug = true;
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const weatherData = {
        name: 'Nice',
        sys: { country: 'FR' },
        coord: { lat: 43.7, lon: 7.25 }
      };

      formatLocationInfo(weatherData);

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });
  });
});
