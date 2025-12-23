import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getWeatherByMode, getWeatherIconUrl } from '../services/weatherService';

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

// Export a reusable hook for weather data to share across components
export function useWeatherData(location, forecastMode, unit, language, translations, size = 'size-2') {
  // Set default values within the function
  forecastMode = forecastMode || 'today';
  unit = unit || 'metric';
  language = language || 'en';
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  
  // Force a refresh when language changes
  useEffect(() => {
    if (currentLanguage !== language) {
      console.log(`Language changed from ${currentLanguage} to ${language}, forcing weather data refresh`);
      setCurrentLanguage(language);
      setLoading(true); // This will trigger a refetch
    }
  }, [language, currentLanguage]);
  
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        console.log(`WeatherDisplay: Fetching weather with language: ${language}`);
        const data = await getWeatherByMode(location, forecastMode, unit, language);
        setWeatherData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather data every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [location, forecastMode, unit, language]);
  


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
    
    // Extract weather data
    const temp = displayData.main?.temp;
    const weatherDescription = displayData.weather?.[0]?.description;
    const weatherIcon = displayData.weather?.[0]?.icon;
    const windSpeed = displayData.wind?.speed;
    const humidity = displayData.main?.humidity;
    
    // Debug info for translations
    console.log(`Weather data received for language: ${language}`);
    console.log(`Weather description: ${weatherDescription}`);
    
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
      </>
    );
  };
  
  return { loading, error, weatherData, renderWeatherContent };
}

// Main WeatherDisplay component
function WeatherDisplay({ location, forecastMode = 'today', unit = 'metric', position = 'top-right', language = 'en', translations, timePosition, datePosition, showTime, showDate, size = 'size-2' }) {
  
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
      console.log(`Language changed from ${lastLanguage} to ${language}, weather data will refresh`);
      setLastLanguage(language);
    }
  }, [language, lastLanguage]);
  
  // Use the shared hook for weather data
  const { renderWeatherContent } = useWeatherData(location, forecastMode, unit, language, translations, size);
  
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
  
  // Render standalone weather component
  return (
    <div 
      className={`weather-widget ${positionClasses[validPosition]} fixed z-10 bg-black bg-opacity-50 text-white p-3 rounded-lg transition-all duration-300`}
    >
      {renderWeatherContent()}
    </div>
  );
}

WeatherDisplay.propTypes = {
  location: PropTypes.string.isRequired,
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
  showDate: PropTypes.bool
};

export default WeatherDisplay;
