import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { getWeatherByMode, getWeatherIconUrl, formatLocationInfo, fetchAirQuality, getAirQualityDescription, getEffectiveLocation } from '../services/weatherService';
import defaultConfig from '../config/defaults.json';

// Weather sizes definition - shared between hook and component
const weatherSizes = {
  'size-1': {
    icon: 'w-8 h-8',
    temp: 'text-lg',
    text: 'text-xs'
  },
  'size-2': {
    icon: 'w-12 h-12',
    temp: 'text-xl',
    text: 'text-sm'
  },
  'size-3': {
    icon: 'w-16 h-16',
    temp: 'text-2xl',
    text: 'text-base'
  },
  'size-4': {
    icon: 'w-20 h-20',
    temp: 'text-3xl',
    text: 'text-lg'
  },
  'size-5': {
    icon: 'w-24 h-24',
    temp: 'text-4xl',
    text: 'text-xl'
  }
};

// Define a reusable hook for weather data to share across components
function useWeatherData(location, forecastMode, unit, language, translations, size = 'size-2', apiKey = null, refreshInterval = 60, showAirQuality = false, coordinates = null) {
  // Set default values within the function
  forecastMode = forecastMode || 'today';
  unit = unit || 'metric';
  language = language || 'en';
  refreshInterval = refreshInterval || 60; // Default to 60 minutes if not provided
  
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(refreshInterval * 60);
  
  // Force a refresh when language or refreshInterval changes
  useEffect(() => {
    if (currentLanguage !== language) {
      if (defaultConfig.debug) console.log(`Language changed from ${currentLanguage} to ${language}, forcing weather data refresh`);
      setCurrentLanguage(language);
      setLoading(true); // This will trigger a refetch
    }
  }, [language, currentLanguage]);
  
  // Reset timeRemaining and recalculate nextUpdate when refreshInterval changes
  useEffect(() => {
    // Reset the countdown timer when refresh interval changes
    setTimeRemaining(refreshInterval * 60);
    
    // Also update the nextUpdate time based on the new interval
    if (lastUpdated) {
      const newNextUpdate = new Date(lastUpdated);
      newNextUpdate.setMinutes(newNextUpdate.getMinutes() + refreshInterval);
      setNextUpdate(newNextUpdate);
    }
  }, [refreshInterval, lastUpdated]);
  
  // Create a function to manually trigger weather refresh
  const fetchWeather = async (force = false) => {
    try {
      // Validate essential parameters to avoid unnecessary API calls
      const effectiveLocation = getEffectiveLocation(location, coordinates);
      if (!effectiveLocation) {
        if (defaultConfig.debug) console.log('Weather: Missing location and coordinates, skipping fetch');
        setError('Please enter a location or coordinates');
        return;
      }
      
      // Check if we should refresh based on time elapsed or if forced
      const now = new Date();
      const shouldRefresh = force || 
                           !lastUpdated || 
                           !nextUpdate || 
                           now >= nextUpdate;
      
      if (!shouldRefresh) {
        if (defaultConfig.debug) console.log('Weather data still fresh, skipping fetch');
        
        // Even if we don't fetch new data, we should still update the nextUpdate time
        // to reflect the current refreshInterval value - this handles interval changes
        if (force && lastUpdated) {
          const updatedNextTime = new Date(lastUpdated);
          updatedNextTime.setMinutes(updatedNextTime.getMinutes() + refreshInterval);
          setNextUpdate(updatedNextTime);
          setTimeRemaining(refreshInterval * 60);
          if (defaultConfig.debug) console.log(`Weather interval changed to ${refreshInterval} minutes, next update recalculated`);
        }
        
        return;
      }
      
      // Set loading state
      setLoading(true);
      if (defaultConfig.debug) {
        const effectiveLocationForDebug = getEffectiveLocation(location, coordinates);
        const isUsingCoords = typeof effectiveLocationForDebug === 'object';
        if (isUsingCoords) {
          console.log(`WeatherDisplay: Fetching weather using coordinates: [${effectiveLocationForDebug.lat}, ${effectiveLocationForDebug.lon}]`);
        } else {
          console.log(`WeatherDisplay: Fetching weather using city name: ${effectiveLocationForDebug}`);
        }
        console.log(`Weather parameters: forecastMode=${forecastMode}, unit=${unit}, language=${language}, apiKey=${apiKey ? 'provided' : 'missing'}`);
      }
      
      // Fetch weather data with proper error handling
      try {
        const data = await getWeatherByMode(location, forecastMode, unit, language, apiKey, translations, coordinates);
        if (!data) throw new Error('No weather data received');
        
        setWeatherData(data);
        
        // If air quality feature is enabled, fetch air quality data
        if (showAirQuality) {
          // Air quality requires coordinates, which we get from weather data
          const displayData = data.current || data.forecast;
          
          if (displayData?.coord) {
            const { lat, lon } = displayData.coord;
            if (defaultConfig.debug) console.log(`Fetching air quality data for [${lat}, ${lon}], forecast mode: ${forecastMode}`);
            try {
              const airQuality = await fetchAirQuality(lat, lon, apiKey);
              if (airQuality) {
                setAirQualityData(airQuality);
                if (defaultConfig.debug) console.log('Air quality data received:', airQuality);
              } else {
                if (defaultConfig.debug) console.log('No air quality data received');
                setAirQualityData(null);
              }
            } catch (airQualityError) {
              if (defaultConfig.debug) console.error('Error fetching air quality data:', airQualityError);
              setAirQualityData(null);
            }
          } else {
            if (defaultConfig.debug) console.log('Weather data does not contain coordinates for air quality lookup. Data:', displayData);
            setAirQualityData(null);
          }
        } else {
          // Reset air quality data if feature is disabled
          setAirQualityData(null);
        }
        
        setError(null);
        
        // Set timestamps
        const currentTime = new Date();
        setLastUpdated(currentTime);
        
        // Calculate next update time
        const nextUpdateTime = new Date(currentTime);
        nextUpdateTime.setMinutes(nextUpdateTime.getMinutes() + refreshInterval);
        setNextUpdate(nextUpdateTime);
        
        // Reset countdown
        setTimeRemaining(refreshInterval * 60);
      } catch (fetchError) {
        if (defaultConfig.debug) console.error('Error fetching weather data:', fetchError);
        setError(fetchError.message || 'Failed to fetch weather data');
      }
      
    } catch (err) {
      if (defaultConfig.debug) console.error('Error in weather fetch process:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Expose the fetchWeather function for manual refresh
  useEffect(() => {
    // Use a memoized function to avoid recreation on each render
    const refreshFunction = () => fetchWeather();
    
    // Initial fetch
    fetchWeather();
    
    // Set up the interval for auto-refresh based on the configured interval
    // Use large intervals (minutes) to avoid excessive refreshes
    const intervalId = setInterval(refreshFunction, refreshInterval * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [location, forecastMode, unit, language, apiKey, refreshInterval, showAirQuality]);
  
  // Update countdown timer every second
  useEffect(() => {
    if (!nextUpdate) return;
    
    // Update immediately to ensure UI consistency
    const updateTimeRemaining = () => {
      const now = new Date();
      const diffMs = nextUpdate - now;
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));
      setTimeRemaining(diffSec);
    };
    
    // Initial update
    updateTimeRemaining();
    
    // Then update every second, but not too frequently
    const countdownInterval = setInterval(updateTimeRemaining, 1000);
    
    return () => {
      clearInterval(countdownInterval);
    };
    // nextUpdate is the only dependency we need
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextUpdate]);
  


  // Prepare UI content based on data state
  const renderWeatherContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
        </div>
      );
    }
    
    if (error) {
      return <div className="text-sm text-red-300 text-center">⚠️ {error}</div>;
    }
    
    const displayData = weatherData?.current || weatherData?.forecast;
    
    if (!displayData) {
      return null;
    }
    
    // Format temperature with unit
    const formatTemp = (temp) => {
      const roundedTemp = Math.round(temp);
      return `${roundedTemp}°${unit === 'metric' ? 'C' : 'F'}`;
    };
    
    // Helper function to get location name for display
    const getLocationDisplayName = (data) => {
      // First try to use the formatted location info
      const formattedLocation = formatLocationInfo(data)?.name;
      if (formattedLocation) {
        return formattedLocation;
      }
      
      // Fallback to manually constructing the name
      if (data.name) {
        if (data.sys?.country) {
          return `${data.name}, ${data.sys.country}`;
        }
        return data.name;
      }
      
      // Last resort
      return 'Unknown location';
    };
    
    // Extract weather data
    const temp = displayData.main?.temp;
    const weatherDescription = displayData.weather?.[0]?.description;
    const weatherIcon = displayData.weather?.[0]?.icon;
    const windSpeed = displayData.wind?.speed;
    const humidity = displayData.main?.humidity;
    
    // Debug info for translations - only shown when debug mode is enabled
    if (defaultConfig.debug) {
      console.log(`Weather data received for language: ${language}`);
      console.log(`Weather description: ${weatherDescription}`);
    }
    
    const t = translations[language] || translations['en'];
    
    // Build the title based on weather data and forecast mode
    let title;
    if (weatherData?.current) {
      title = t.currentWeather;
    } else {
      // Add the context (today or tomorrow) in brackets
      let contextKey;
      
      if (forecastMode === 'tomorrow') {
        contextKey = t.forecastModes?.tomorrow;
      } else if (forecastMode === 'smart') {
        const now = new Date();
        const isAfterNoon = now.getHours() >= 12;
        contextKey = isAfterNoon ? t.forecastModes?.tomorrow : t.forecastModes?.today;
      } else {
        contextKey = t.forecastModes?.today;
      }
      
      title = `${t.forecast} (${contextKey})`;
    }
    
    // Extract air quality data if available
    const airQualityIndex = airQualityData?.main?.aqi;
    const airQualityInfo = airQualityIndex !== undefined 
      ? getAirQualityDescription(airQualityIndex, language, translations) 
      : null;
    
    // Debug logging for air quality translations
    if (defaultConfig.debug && airQualityInfo) {
      console.log(`Air quality level (${language}): ${airQualityInfo.level}`);
      console.log(`Air quality translations available: ${translations?.[language]?.airQualityLevels ? 'yes' : 'no'}`);
    }
    
    return (
      <>
        <div className="text-sm font-medium mb-1 text-center">{title}</div>
        <div className="flex items-center justify-center">
          {weatherIcon && (
            <img 
              src={getWeatherIconUrl(weatherIcon)} 
              alt={weatherDescription} 
              className={weatherSizes[size]?.icon || "w-12 h-12"}
            />
          )}
          <div className="ml-2">
            {temp && <div className={`${weatherSizes[size]?.temp || "text-xl"} font-bold text-center`}>{formatTemp(temp)}</div>}
            {weatherDescription && (
              <div className={`${weatherSizes[size]?.text || "text-sm"} capitalize text-center`}>{weatherDescription}</div>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs grid grid-cols-2 gap-1">
          {windSpeed !== undefined && (
            <div className="text-center">
              💨 {windSpeed} {unit === 'metric' ? 'm/s' : 'mph'}
            </div>
          )}
          {humidity !== undefined && (
            <div className="text-center">
              💧 {humidity}%
            </div>
          )}
        </div>
        
        {/* Air Quality Display */}
        {showAirQuality && airQualityInfo && (
          <div className="mt-2 border-t border-white border-opacity-20 pt-2">
            <div className="text-xs font-medium mb-1">
              {t.airQuality || 'Air Quality'}: {airQualityInfo.level}
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`${airQualityInfo.color} h-1.5`} 
                style={{ width: `${airQualityIndex * 20}%` }} 
              ></div>
            </div>
            {airQualityData?.components && (
              <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <div>PM2.5: {airQualityData.components.pm2_5} μg/m³</div>
                <div>PM10: {airQualityData.components.pm10} μg/m³</div>
              </div>
            )}
          </div>
        )}
        
        {/* Location footer with name and coordinates */}
        {displayData && (
          <div className="mt-2 text-xs text-center border-t border-white border-opacity-20 pt-1 font-light tracking-wide">
            <span className="font-medium">
              {getLocationDisplayName(displayData)}
            </span>
            {formatLocationInfo(displayData)?.coordinates && (
              <span className="text-white text-opacity-75 ml-1">{formatLocationInfo(displayData)?.coordinates}</span>
            )}
          </div>
        )}
      </>
    );
  };
  
  // Format the time remaining for display
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    // If more than an hour, show hours and minutes
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    // If less than an hour but more than a minute, show minutes and seconds
    if (minutes > 0) {
      return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    }
    
    // If less than a minute, just show seconds
    return `${seconds}s`;
  };
  
  // Create a stable refreshWeather function using useCallback
  const stableRefreshWeather = useCallback((force = true) => {
    fetchWeather(force);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, location, forecastMode, unit, apiKey]);
  
  return { 
    loading, 
    error, 
    weatherData,
    airQualityData,
    renderWeatherContent,
    lastUpdated,
    nextUpdate,
    timeRemaining,
    formattedTimeRemaining: formatTimeRemaining(),
    refreshWeather: stableRefreshWeather // Expose stable refresh function
  };
}

// Main WeatherDisplay component
function WeatherDisplay({ 
  location, 
  coordinates = null,
  forecastMode = 'today', 
  unit = 'metric', 
  position = 'top-right', 
  language = 'en', 
  translations, 
  timePosition, 
  datePosition, 
  showTime, 
  showDate, 
  size = 'size-2', 
  apiKey = null,
  refreshInterval = 60, 
  showRefreshCountdown = false,
  showAirQuality = false
}) {
  
  // Position classes mapping - same as in App.jsx
  const positionClasses = {
    'top-left': 'absolute top-4 left-4',
    'top-center': 'absolute top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'absolute top-4 right-4',
    'center-left': 'absolute top-1/2 left-4 transform -translate-y-1/2',
    'center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'center-right': 'absolute top-1/2 right-4 transform -translate-y-1/2',
    'bottom-left': 'absolute bottom-16 left-4',
    'bottom-center': 'absolute bottom-16 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'absolute bottom-16 right-4'
  };
  
  // Keep track of the last language to detect changes
  const [lastLanguage, setLastLanguage] = useState(language);
  
  // Check if language changed
  useEffect(() => {
    if (lastLanguage !== language) {
      if (defaultConfig.debug) console.log(`Language changed from ${lastLanguage} to ${language}, weather data will refresh`);
      setLastLanguage(language);
    }
  }, [language, lastLanguage]);
  
  // Keep track of location and coordinates to detect changes
  const [lastLocation, setLastLocation] = useState(location);
  const [lastCoordinates, setLastCoordinates] = useState(coordinates);
  
  // Use the shared hook for weather data
  const { 
    renderWeatherContent, 
    formattedTimeRemaining, 
    refreshWeather,
    nextUpdate
  } = useWeatherData(location, forecastMode, unit, language, translations, size, apiKey, refreshInterval, showAirQuality, coordinates);
  
  // Check if location or coordinates changed (moved after useWeatherData to avoid reference error)
  useEffect(() => {
    const locationChanged = lastLocation !== location;
    const coordinatesChanged = coordinates && lastCoordinates && 
      (coordinates.lat !== lastCoordinates.lat || coordinates.lon !== lastCoordinates.lon);
    
    if (locationChanged) {
      if (defaultConfig.debug) console.log(`Location changed from "${lastLocation}" to "${location}", refreshing weather`);
      setLastLocation(location);
      refreshWeather(true);
    }
    
    if (coordinatesChanged) {
      if (defaultConfig.debug) console.log(`Coordinates changed from [${lastCoordinates.lat}, ${lastCoordinates.lon}] to [${coordinates.lat}, ${coordinates.lon}], refreshing weather`);
      setLastCoordinates(coordinates);
      refreshWeather(true);
    }
  }, [location, coordinates, lastLocation, lastCoordinates, refreshWeather]);
  
  // React to changes in refreshInterval from parent component - track previous value
  const refreshIntervalRef = useRef(refreshInterval);
  
  useEffect(() => {
    // Only refresh if the interval has actually changed
    if (refreshIntervalRef.current !== refreshInterval && nextUpdate) {
      refreshIntervalRef.current = refreshInterval;
      // Use setTimeout to break potential circular updates
      setTimeout(() => {
        if (defaultConfig.debug) console.log('Refresh interval changed, updating weather countdown');
        refreshWeather(true);
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);
  
  // Check if we should render this as part of an existing time/date component
  const shouldRenderWithTimeComponent = showTime && timePosition === position;
  const shouldRenderWithDateComponent = showDate && datePosition === position && 
                                      (!showTime || timePosition !== datePosition);
  const allThreeInSamePosition = showTime && showDate && 
                               timePosition === position && 
                               datePosition === position;
  
  // In these cases, we don't render our component separately since it will be rendered with time or date
  if (shouldRenderWithTimeComponent || shouldRenderWithDateComponent || allThreeInSamePosition) {
    return null;
  }
  
  // If we're here, we need to render the weather on its own
  const validPosition = position && positionClasses[position] ? position : 'top-right';
  
  // Create a custom version of renderWeatherContent that includes the countdown and refresh button
  const renderCustomWeatherContent = () => {
    return (
      <>
        {renderWeatherContent()}
        
        {/* Weather refresh countdown and button */}
        {showRefreshCountdown && (
          <div className="mt-2 pt-1 border-t border-white border-opacity-20 flex items-center justify-between text-xs">
            <div className="text-white text-opacity-75">
              {translations[language]?.nextUpdate || 'Next'}: {formattedTimeRemaining}
            </div>
            <button 
              onClick={() => refreshWeather()} 
              className="px-1 py-0.5 bg-accent bg-opacity-70 hover:bg-opacity-100 rounded text-white text-opacity-90 hover:text-opacity-100 transition-all"
              title="Refresh weather now"
            >
              ↻
            </button>
          </div>
        )}
      </>
    );
  };
  
  // Render standalone weather component
  return (
    <div 
      className={`weather-widget ${positionClasses[validPosition]} fixed z-10 bg-black bg-opacity-50 text-white p-3 rounded-lg transition-all duration-300`}
    >
      {renderCustomWeatherContent()}
    </div>
  );
}

WeatherDisplay.propTypes = {
  location: PropTypes.string.isRequired,
  coordinates: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number
  }),
  forecastMode: PropTypes.oneOf(['today', 'tomorrow', 'smart']),
  unit: PropTypes.oneOf(['metric', 'imperial']),
  position: PropTypes.oneOf([
    'top-left', 
    'top-right', 
    'top-center',
    'center-left',
    'center',
    'center-right',
    'bottom-left', 
    'bottom-right', 
    'bottom-center'
  ]),
  size: PropTypes.oneOf(['size-1', 'size-2', 'size-3', 'size-4', 'size-5']),
  language: PropTypes.string,
  translations: PropTypes.object.isRequired,
  timePosition: PropTypes.string,
  datePosition: PropTypes.string,
  showTime: PropTypes.bool,
  showDate: PropTypes.bool,
  apiKey: PropTypes.string,
  refreshInterval: PropTypes.number,
  showRefreshCountdown: PropTypes.bool,
  showAirQuality: PropTypes.bool
};

export default WeatherDisplay;
export { useWeatherData };
