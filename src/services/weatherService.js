import axios from 'axios';

// OpenWeatherMap API key - This should be stored securely in production
// For this example we're using a free API key with limited requests
const API_KEY = '4ae2636d8dfbdc3044bede63951a019b'; // Replace with your own API key

// Fetch current weather for a location
const fetchCurrentWeather = async (location, unit = 'metric', language = 'en') => {
  try {
    console.log(`API call: fetchCurrentWeather with language=${language}`);
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: location,
        appid: API_KEY,
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
const fetchForecast = async (location, unit = 'metric', language = 'en') => {
  try {
    console.log(`API call: fetchForecast with language=${language}`);
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        q: location,
        appid: API_KEY,
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
    
    return tomorrow || response.data.list[0];
  } catch (error) {
    console.error('Error fetching forecast:', error);
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
  console.log(`Mapping app language "${appLanguage}" to API language code "${apiLanguage}"`);
  return apiLanguage;
};

// Get weather based on mode (today, tomorrow, smart)
const getWeatherByMode = async (location, mode, unit = 'metric', language = 'en') => {
  // Get the correct API language code
  const apiLanguage = mapLanguageToApiCode(language);
  
  console.log(`Weather API call with language: ${apiLanguage} (from app language: ${language})`);
  const currentWeather = await fetchCurrentWeather(location, unit, apiLanguage);
  
  if (mode === 'today') {
    return { current: currentWeather, forecast: null };
  } else if (mode === 'tomorrow') {
    console.log(`Fetching forecast with language: ${apiLanguage}`);
    const forecast = await fetchForecast(location, unit, apiLanguage);
    return { current: null, forecast };
  } else if (mode === 'smart') {
    // Smart mode: Show today's weather until noon, then tomorrow's
    const now = new Date();
    console.log(`Smart mode forecast with language: ${apiLanguage}`);
    const forecast = await fetchForecast(location, unit, apiLanguage);
    
    if (now.getHours() < 12) {
      // Before noon, show today's weather
      return { current: currentWeather, forecast: null };
    } else {
      // After noon, show tomorrow's forecast
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

export { fetchCurrentWeather, fetchForecast, getWeatherByMode, getWeatherIconUrl, mapLanguageToApiCode };
