import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { getWeatherIconUrl, formatLocationInfo, getAirQualityDescription } from '../services/weatherService';
import { useWeatherData } from '../hooks/useWeatherData';

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

// WeatherDisplay Component - Optimized and Refactored
const WeatherDisplay = memo(({ 
  location = '', 
  forecastMode = 'today', 
  unit = 'metric', 
  language = 'en', 
  translations = {},
  size = 'size-2',
  apiKey = null,
  refreshInterval = 60,
  showAirQuality = false,
  coordinates = null,
  showLastUpdated = false,
  showRefreshButton = false
}) => {
  // Use the optimized weather data hook
  const {
    weatherData,
    airQualityData,
    loading,
    error,
    timeRemaining,
    lastUpdated,
    refreshWeather
  } = useWeatherData({
    location,
    forecastMode,
    unit,
    language,
    translations,
    apiKey,
    refreshInterval,
    showAirQuality,
    coordinates
  });

  // Format temperature with unit
  const formatTemp = (temp) => {
    const roundedTemp = Math.round(temp);
    return `${roundedTemp}°${unit === 'metric' ? 'C' : 'F'}`;
  };

  // Helper function to get location name for display
  const getLocationDisplayName = (data) => {
    const formattedLocation = formatLocationInfo(data)?.name;
    if (formattedLocation) {
      return formattedLocation;
    }
    
    if (data.name) {
      if (data.sys?.country) {
        return `${data.name}, ${data.sys.country}`;
      }
      return data.name;
    }
    
    return 'Unknown location';
  };

  // Format the time remaining for display
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    }
    
    return `${seconds}s`;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return <div className="text-sm text-red-300 text-center">⚠️ {error}</div>;
  }
  
  // Get display data
  const displayData = weatherData?.current || weatherData?.forecast;
  
  if (!displayData) {
    return null;
  }

  // Extract weather data
  const temp = displayData.main?.temp;
  const weatherDescription = displayData.weather?.[0]?.description;
  const weatherIcon = displayData.weather?.[0]?.icon;
  const windSpeed = displayData.wind?.speed;
  const humidity = displayData.main?.humidity;

  const t = translations[language] || translations['en'];
  
  // Build the title based on weather data and forecast mode
  let title;
  if (weatherData?.current) {
    title = t.currentWeather;
  } else {
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

  return (
    <div className="weather-display">
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
      
      {/* Location footer */}
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
      
      {/* Debug info */}
      {showLastUpdated && lastUpdated && (
        <div className="mt-1 text-xs text-center text-white text-opacity-50">
          Updated: {lastUpdated.toLocaleTimeString()}
          <br />
          Next: {formatTimeRemaining()}
        </div>
      )}
      
      {/* Manual refresh button */}
      {showRefreshButton && (
        <div className="mt-2 text-center">
          <button
            onClick={() => refreshWeather()}
            className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
            type="button"
          >
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
});

WeatherDisplay.displayName = 'WeatherDisplay';

WeatherDisplay.propTypes = {
  location: PropTypes.string,
  forecastMode: PropTypes.oneOf(['today', 'tomorrow', 'smart']),
  unit: PropTypes.oneOf(['metric', 'imperial']),
  language: PropTypes.string,
  translations: PropTypes.object,
  size: PropTypes.oneOf(['size-1', 'size-2', 'size-3', 'size-4', 'size-5']),
  apiKey: PropTypes.string,
  refreshInterval: PropTypes.number,
  showAirQuality: PropTypes.bool,
  coordinates: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number
  }),
  showLastUpdated: PropTypes.bool,
  showRefreshButton: PropTypes.bool
};

export default WeatherDisplay;
