import axios from 'axios';
import defaultConfig from '../config/defaults.json';

// Helper for conditional logging
const debugLog = (message, ...args) => {
  if (defaultConfig.debug) {
    console.log(message, ...args);
  }
};

// OpenWeatherMap API key - Fetched from configuration
// This provides more flexibility and easier maintenance
const API_KEY = defaultConfig.weather.apiKey || '4ae2636d8dfbdc3044bede63951a019b'; // Fallback to default

// Fetch current weather for a location
const fetchCurrentWeather = async (location, unit = 'metric', language = 'en', customApiKey = null) => {
  try {
    const apiKey = customApiKey || API_KEY;
    debugLog(`API call: fetchCurrentWeather with language=${language}`);
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: location,
        appid: apiKey,
        units: unit,
        lang: language
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
};

// Fetch 5-day forecast for a location
const fetchForecast = async (location, unit = 'metric', language = 'en', customApiKey = null) => {
  try {
    const apiKey = customApiKey || API_KEY;
    debugLog(`API call: fetchForecast with language=${language}`);
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        q: location,
        appid: apiKey,
        units: unit,
        lang: language
      }
    });
    
    // Filter for tomorrow's forecast (assuming data points are 3 hours apart)
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setHours(12, 0, 0, 0); // Noon tomorrow
    
    // Get forecast for noon tomorrow (or closest time)
    const tomorrow = response.data.list.find(item => {
      const forecastDate = new Date(item.dt * 1000);
      return forecastDate.getDate() === tomorrowDate.getDate() && 
             Math.abs(forecastDate.getHours() - 12) < 3; // Within 3 hours of noon
    });
    
    // Create a complete forecast object that includes city/coord information
    // This ensures location and coordinates are available for both today and tomorrow forecasts
    const forecastData = tomorrow || response.data.list[0];
    if (forecastData) {
      // Add city and coordinates information from the main response to the forecast item
      forecastData.name = response.data.city.name;
      forecastData.sys = { country: response.data.city.country };
      forecastData.coord = response.data.city.coord;
      
      debugLog('Enhanced forecast data with location info:', {
        name: forecastData.name,
        country: forecastData.sys.country,
        coords: forecastData.coord
      });
    }
    
    return forecastData;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
};

// Fetch air quality data for a location
const fetchAirQuality = async (lat, lon, customApiKey = null) => {
  try {
    const apiKey = customApiKey || API_KEY;
    debugLog(`API call: fetchAirQuality for coordinates [${lat}, ${lon}]`);
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
      params: {
        lat: lat,
        lon: lon,
        appid: apiKey
      }
    });
    
    // Return just the air quality data
    if (response.data?.list?.length > 0) {
      return response.data.list[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return null;
  }
};

// Helper function to map application language to API language code
const mapLanguageToApiCode = (appLanguage) => {
  // Map app languages to OpenWeatherMap API languages
  // According to OpenWeatherMap API documentation: https://openweathermap.org/current#multi
  const langMap = {
    'en': 'en', // English
    'es': 'es', // Spanish
    'fr': 'fr', // French
    'de': 'de', // German
    'it': 'it', // Italian
    'zh': 'zh_cn', // Chinese (Simplified)
    'ja': 'ja'  // Japanese
  };
  
  // Use the mapped language or default to English
  const apiLanguage = langMap[appLanguage] || 'en';
  debugLog(`Mapping app language "${appLanguage}" to API language code "${apiLanguage}"`);
  return apiLanguage;
};

// Get weather based on mode (today, tomorrow, smart)
const getWeatherByMode = async (location, mode, unit = 'metric', language = 'en', customApiKey = null, translations = null) => {
  // Get the correct API language code
  const apiLanguage = mapLanguageToApiCode(language);
  
  debugLog(`Weather API call with language: ${apiLanguage} (from app language: ${language}), mode: ${mode}`);
  debugLog(`Weather translations available: ${translations ? 'yes' : 'no'}`);
  const currentWeather = await fetchCurrentWeather(location, unit, apiLanguage, customApiKey);
  
  if (mode === 'today') {
    return { current: currentWeather, forecast: null };
  } else if (mode === 'tomorrow') {
    debugLog(`Fetching forecast with language: ${apiLanguage}`);
    const forecast = await fetchForecast(location, unit, apiLanguage, customApiKey);
    
    // Log detailed information about the forecast data for debugging
    if (defaultConfig.debug) {
      debugLog('Tomorrow forecast data:', { 
        hasForecast: !!forecast,
        hasCoords: !!forecast?.coord,
        coords: forecast?.coord,
        cityName: forecast?.name,
        country: forecast?.sys?.country
      });
    }
    
    return { current: null, forecast };
  } else if (mode === 'smart') {
    // Smart mode: Show today's weather until noon, then tomorrow's
    const now = new Date();
    debugLog(`Smart mode forecast with language: ${apiLanguage}`);
    const forecast = await fetchForecast(location, unit, apiLanguage, customApiKey);
    
    if (now.getHours() < 12) {
      // Before noon, show today's weather
      return { current: currentWeather, forecast: null };
    } else {
      // After noon, show tomorrow's forecast
      // Log detailed information about the forecast data for debugging
      if (defaultConfig.debug && forecast) {
        debugLog('Smart mode (afternoon) forecast data:', { 
          hasCoords: !!forecast.coord,
          coords: forecast.coord,
          cityName: forecast.name,
          country: forecast.sys?.country
        });
      }
      return { current: null, forecast };
    }
  }
  
  // Default to current weather
  return { current: currentWeather, forecast: null };
};

// Get appropriate weather icon URL from OpenWeatherMap
const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// Format location information with name and coordinates
const formatLocationInfo = (weatherData) => {
  if (!weatherData) return null;
  
  const locationName = weatherData.name || 'Unknown location';
  const country = weatherData.sys?.country || '';
  const lat = weatherData.coord?.lat;
  const lon = weatherData.coord?.lon;
  
  let formattedName = locationName;
  if (country) {
    formattedName += `, ${country}`;
  }
  
  let formattedCoordinates = '';
  if (typeof lat === 'number' && typeof lon === 'number') {
    // Format to 2 decimal places
    const latFormatted = lat.toFixed(2);
    const lonFormatted = lon.toFixed(2);
    formattedCoordinates = `[${latFormatted}, ${lonFormatted}]`;
  }
  
  // Debug output for location information
  if (defaultConfig.debug) {
    debugLog(`Location info for ${locationName}: coord=${formattedCoordinates}, has coordinates: ${Boolean(lat && lon)}`);
  }
  
  return {
    name: formattedName,
    coordinates: formattedCoordinates,
    formattedString: `${formattedName} ${formattedCoordinates}`,
    lat: lat,
    lon: lon
  };
};

// Helper function to interpret air quality index values
const getAirQualityDescription = (aqi, language = 'en', translations = null) => {
  // According to OpenWeatherMap documentation
  // https://openweathermap.org/api/air-pollution
  
  // Define default air quality key names
  let levelKey;
  let color;
  
  switch(aqi) {
    case 1: 
      levelKey = 'good';
      color = 'bg-green-500';
      break;
    case 2: 
      levelKey = 'fair';
      color = 'bg-lime-500';
      break;
    case 3: 
      levelKey = 'moderate';
      color = 'bg-yellow-500';
      break;
    case 4: 
      levelKey = 'poor';
      color = 'bg-orange-500';
      break;
    case 5: 
      levelKey = 'veryPoor';
      color = 'bg-red-500';
      break;
    default: 
      levelKey = 'unknown';
      color = 'bg-gray-500';
  }
  
  // Get the localized text if translations are available
  let levelText;
  if (translations?.[language]?.airQualityLevels?.[levelKey]) {
    // Use the translated text
    levelText = translations[language].airQualityLevels[levelKey];
  } else {
    // Fallback to English defaults
    const defaultLevels = {
      good: "Good",
      fair: "Fair",
      moderate: "Moderate",
      poor: "Poor",
      veryPoor: "Very Poor",
      unknown: "Unknown"
    };
    levelText = defaultLevels[levelKey];
  }
  
  return { level: levelText, color };
};

export { 
  fetchCurrentWeather, 
  fetchForecast,
  fetchAirQuality,
  getWeatherByMode, 
  getWeatherIconUrl, 
  mapLanguageToApiCode, 
  formatLocationInfo,
  getAirQualityDescription
};
