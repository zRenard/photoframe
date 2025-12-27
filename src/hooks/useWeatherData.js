import { useState, useEffect, useCallback } from 'react';
import { getWeatherByMode, fetchAirQuality } from '../services/weatherService';
import defaults from '../config/defaults.json';

// Helper function to get effective location
const getEffectiveLocation = (location, coordinates) => {
  // If coordinates are provided, use them as priority
  if (coordinates && coordinates.lat && coordinates.lon) {
    return { lat: coordinates.lat, lon: coordinates.lon };
  }
  
  // Fall back to location string
  if (location && location.trim()) {
    return location.trim();
  }
  
  return null;
};

// Weather configuration type
const createWeatherConfig = ({
  location = '',
  forecastMode = 'today',
  unit = 'metric',
  language = 'en',
  apiKey = null,
  refreshInterval = 60,
  showAirQuality = false,
  coordinates = null,
  translations = {}
}) => ({
  location,
  forecastMode,
  unit,
  language,
  apiKey,
  refreshInterval,
  showAirQuality,
  coordinates,
  translations
});

// Custom hook for weather data management
export function useWeatherData(config) {
  const weatherConfig = createWeatherConfig(config);
  const {
    location,
    forecastMode,
    unit,
    language,
    apiKey,
    refreshInterval,
    showAirQuality,
    coordinates,
    translations
  } = weatherConfig;

  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(refreshInterval * 60);

  // Update time remaining countdown
  useEffect(() => {
    if (nextUpdate) {
      const interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((nextUpdate - now) / 1000));
        setTimeRemaining(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextUpdate]);

  // Update next update time when refresh interval changes
  useEffect(() => {
    if (lastUpdated && refreshInterval) {
      const newNextUpdate = new Date(lastUpdated);
      newNextUpdate.setMinutes(newNextUpdate.getMinutes() + refreshInterval);
      setNextUpdate(newNextUpdate);
    }
  }, [refreshInterval, lastUpdated]);

  // Validate location and coordinates
  const validateLocationInput = useCallback(() => {
    const effectiveLocation = getEffectiveLocation(location, coordinates);
    if (!effectiveLocation) {
      setError('Please enter a location or coordinates');
      return false;
    }
    return true;
  }, [location, coordinates]);

  // Check if refresh is needed
  const shouldRefreshData = useCallback((force = false) => {
    if (force) return true;
    if (!lastUpdated || !nextUpdate) return true;
    return new Date() >= nextUpdate;
  }, [lastUpdated, nextUpdate]);

  // Fetch air quality data
  const fetchAirQualityData = useCallback(async (weatherDataResponse) => {
    if (!showAirQuality) {
      setAirQualityData(null);
      return;
    }

    const displayData = weatherDataResponse.current || weatherDataResponse.forecast;
    if (!displayData?.coord) {
      if (defaults.debug) console.log('Weather data does not contain coordinates for air quality lookup');
      setAirQualityData(null);
      return;
    }

    try {
      const { lat, lon } = displayData.coord;
      if (defaults.debug) console.log(`Fetching air quality data for [${lat}, ${lon}]`);
      
      const airQuality = await fetchAirQuality(lat, lon, apiKey);
      setAirQualityData(airQuality || null);
      
      if (defaults.debug) {
        console.log(airQuality ? 'Air quality data received' : 'No air quality data received');
      }
    } catch (airQualityError) {
      if (defaults.debug) console.error('Error fetching air quality data:', airQualityError);
      setAirQualityData(null);
    }
  }, [showAirQuality, apiKey]);

  // Update timestamps and countdown
  const updateTimestamps = useCallback(() => {
    const currentTime = new Date();
    setLastUpdated(currentTime);

    const nextUpdateTime = new Date(currentTime);
    nextUpdateTime.setMinutes(nextUpdateTime.getMinutes() + refreshInterval);
    setNextUpdate(nextUpdateTime);
    setTimeRemaining(refreshInterval * 60);
  }, [refreshInterval]);

  // Handle weather data fetching
  const performWeatherFetch = useCallback(async () => {
    if (defaults.debug) {
      const effectiveLocation = getEffectiveLocation(location, coordinates);
      const locationInfo = typeof effectiveLocation === 'object' 
        ? `coordinates: [${effectiveLocation.lat}, ${effectiveLocation.lon}]`
        : `city name: ${effectiveLocation}`;
      
      console.log(`WeatherDisplay: Fetching weather using ${locationInfo}`);
      console.log(`Weather parameters: forecastMode=${forecastMode}, unit=${unit}, language=${language}, apiKey=${apiKey ? 'provided' : 'missing'}`);
    }

    const data = await getWeatherByMode(
      location,
      forecastMode,
      unit,
      language,
      apiKey,
      translations,
      coordinates
    );

    if (!data) {
      throw new Error('No weather data received');
    }

    setWeatherData(data);
    setError(null);

    // Fetch air quality data if enabled
    await fetchAirQualityData(data);

    // Update timestamps
    updateTimestamps();
  }, [
    location,
    coordinates,
    forecastMode,
    unit,
    language,
    apiKey,
    translations,
    fetchAirQualityData,
    updateTimestamps
  ]);

  // Main fetch weather function
  const fetchWeather = useCallback(async (force = false) => {
    try {
      // Validate location input
      if (!validateLocationInput()) {
        setLoading(false);
        return;
      }

      // Check if refresh is needed
      if (!shouldRefreshData(force)) {
        if (defaults.debug) console.log('Weather data still fresh, skipping fetch');
        
        // Update interval if forced (handles interval changes)
        if (force && lastUpdated) {
          updateTimestamps();
          if (defaults.debug) console.log(`Weather interval changed to ${refreshInterval} minutes`);
        }
        return;
      }

      setLoading(true);
      await performWeatherFetch();

    } catch (fetchError) {
      if (defaults.debug) console.error('Error fetching weather data:', fetchError);
      setError(fetchError.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, [
    validateLocationInput,
    shouldRefreshData,
    performWeatherFetch,
    lastUpdated,
    updateTimestamps,
    refreshInterval
  ]);

  // Auto-refresh effect
  useEffect(() => {
    // Initial fetch
    fetchWeather();

    // Set up interval for auto-refresh
    const intervalId = setInterval(() => {
      fetchWeather();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchWeather, refreshInterval]);

  // Expose manual refresh function
  const refreshWeather = useCallback(() => {
    fetchWeather(true);
  }, [fetchWeather]);

  return {
    weatherData,
    airQualityData,
    loading,
    error,
    timeRemaining,
    lastUpdated,
    nextUpdate,
    refreshWeather
  };
}
