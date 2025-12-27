import { useState, useEffect, useCallback } from 'react';
import defaultConfig from '../config/defaults.json';

export const useSettings = () => {
  // State for all settings
  const [showDate, setShowDate] = useState(defaultConfig.dateDisplay.show);
  const [showTime, setShowTime] = useState(defaultConfig.timeDisplay.show);
  const [enableCalendar, setEnableCalendar] = useState(defaultConfig.dateDisplay.enableCalendar);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(defaultConfig.dateDisplay.firstDayOfWeek || 0);
  const [showImageCounter, setShowImageCounter] = useState(defaultConfig.showImageCounter);
  const [showCountdown, setShowCountdown] = useState(defaultConfig.showCountdown);
  const [countdownPosition, setCountdownPosition] = useState(defaultConfig.countdownPosition ?? "bottom-left");
  const [imageCounterPosition, setImageCounterPosition] = useState(defaultConfig.imageCounterPosition ?? "bottom-right");
  const [uiControlsPosition, setUiControlsPosition] = useState(defaultConfig.uiControlsPosition ?? "top-right");
  const [language, setLanguage] = useState(defaultConfig.language);
  const [theme, setTheme] = useState(defaultConfig.theme);
  const [rotationTime, setRotationTime] = useState(defaultConfig.rotationTime);
  const [timeFormat24h, setTimeFormat24h] = useState(defaultConfig.timeDisplay.format24h);
  const [showSeconds, setShowSeconds] = useState(defaultConfig.timeDisplay.showSeconds);
  const [imageDisplayMode, setImageDisplayMode] = useState(defaultConfig.imageDisplayMode);
  const [slideshowOrder, setSlideshowOrder] = useState(defaultConfig.slideshowOrder ?? 'sequential');
  
  // Time and date display settings
  const [timeDisplay, setTimeDisplay] = useState({
    position: defaultConfig.timeDisplay.position,
    size: defaultConfig.timeDisplay.size
  });
  
  const [dateDisplay, setDateDisplay] = useState({
    position: defaultConfig.dateDisplay.position,
    size: defaultConfig.dateDisplay.size,
    format: defaultConfig.dateDisplay.format
  });

  // Calendar events
  const [calendarEvents, setCalendarEvents] = useState(defaultConfig.dateDisplay?.calendarEvents ?? []);

  // Timer settings
  const [timerEnabled, setTimerEnabled] = useState(defaultConfig.timeDisplay?.timer?.enabled ?? false);
  const [timerType, setTimerType] = useState(defaultConfig.timeDisplay?.timer?.type ?? 'countdown');
  const [countdownHours, setCountdownHours] = useState(defaultConfig.timeDisplay?.timer?.countdownHours ?? 0);
  const [countdownMinutes, setCountdownMinutes] = useState(defaultConfig.timeDisplay?.timer?.countdownMinutes ?? 5);
  const [countdownSeconds, setCountdownSeconds] = useState(defaultConfig.timeDisplay?.timer?.countdownSeconds ?? 0);
  const [timerTimeoutBlinkDuration, setTimerTimeoutBlinkDuration] = useState(defaultConfig.timeDisplay?.timer?.timeoutBlinkDuration ?? 10);
  const [countdownFontSize, setCountdownFontSize] = useState(defaultConfig.timeDisplay?.timer?.countdownFontSize ?? 'size-4');
  const [chronometerFontSize, setChronometerFontSize] = useState(defaultConfig.timeDisplay?.timer?.chronometerFontSize ?? 'size-4');

  // Weather settings
  const [showWeather, setShowWeather] = useState(defaultConfig.weather?.show ?? true);
  const [weatherLocation, setWeatherLocation] = useState(defaultConfig.weather?.location ?? "Nice, France");
  const [weatherCoordinates, setWeatherCoordinates] = useState(defaultConfig.weather?.coordinates ?? { lat: 43.7, lon: 7.25 });
  const [forecastMode, setForecastMode] = useState(defaultConfig.weather?.forecastMode ?? "smart");
  const [weatherPosition, setWeatherPosition] = useState(defaultConfig.weather?.position ?? "top-right");
  const [weatherUnit, setWeatherUnit] = useState(defaultConfig.weather?.unit ?? "metric");
  const [weatherSize, setWeatherSize] = useState(defaultConfig.weather?.size ?? "size-2");
  const [weatherRefreshInterval, setWeatherRefreshInterval] = useState(defaultConfig.weather?.refreshInterval ?? 60);
  const [showWeatherCountdown, setShowWeatherCountdown] = useState(defaultConfig.weather?.showCountdown ?? false);
  const [showAirQuality, setShowAirQuality] = useState(defaultConfig.weather?.showAirQuality ?? false);

  // Helper functions to load different setting categories
  const loadBasicSettings = useCallback((settings) => {
    if (settings.language !== undefined) setLanguage(settings.language);
    if (settings.theme !== undefined) setTheme(settings.theme);
    if (settings.imageDisplayMode !== undefined) setImageDisplayMode(settings.imageDisplayMode);
    if (settings.showImageCounter !== undefined) setShowImageCounter(settings.showImageCounter);
    if (settings.showCountdown !== undefined) setShowCountdown(settings.showCountdown);
    if (settings.countdownPosition !== undefined) setCountdownPosition(settings.countdownPosition);
    if (settings.imageCounterPosition !== undefined) setImageCounterPosition(settings.imageCounterPosition);
    if (settings.uiControlsPosition !== undefined) setUiControlsPosition(settings.uiControlsPosition);
    if (settings.rotationTime !== undefined) setRotationTime(settings.rotationTime);
    if (settings.slideshowOrder !== undefined) setSlideshowOrder(settings.slideshowOrder);
  }, []);

  const loadWeatherSettings = useCallback((weather) => {
    if (!weather) return;
    if (weather.show !== undefined) setShowWeather(weather.show);
    if (weather.location !== undefined) setWeatherLocation(weather.location);
    if (weather.coordinates !== undefined) setWeatherCoordinates(weather.coordinates);
    if (weather.forecastMode !== undefined) setForecastMode(weather.forecastMode);
    if (weather.position !== undefined) setWeatherPosition(weather.position);
    if (weather.unit !== undefined) setWeatherUnit(weather.unit);
    if (weather.size !== undefined) setWeatherSize(weather.size);
    if (weather.refreshInterval !== undefined) setWeatherRefreshInterval(weather.refreshInterval);
    if (weather.showCountdown !== undefined) setShowWeatherCountdown(weather.showCountdown);
    if (weather.showAirQuality !== undefined) setShowAirQuality(weather.showAirQuality);
  }, []);

  const loadTimerSettings = useCallback((timer) => {
    if (!timer) return;
    if (timer.enabled !== undefined) setTimerEnabled(timer.enabled);
    if (timer.type !== undefined) setTimerType(timer.type);
    if (timer.countdownHours !== undefined) setCountdownHours(timer.countdownHours);
    if (timer.countdownMinutes !== undefined) setCountdownMinutes(timer.countdownMinutes);
    if (timer.countdownSeconds !== undefined) setCountdownSeconds(timer.countdownSeconds);
    if (timer.timeoutBlinkDuration !== undefined) setTimerTimeoutBlinkDuration(timer.timeoutBlinkDuration);
    if (timer.countdownFontSize !== undefined) setCountdownFontSize(timer.countdownFontSize);
    if (timer.chronometerFontSize !== undefined) setChronometerFontSize(timer.chronometerFontSize);
  }, []);

  const loadTimeSettings = useCallback((timeDisplayObj) => {
    if (!timeDisplayObj) return;
    if (timeDisplayObj.show !== undefined) setShowTime(timeDisplayObj.show);
    if (timeDisplayObj.format24h !== undefined) setTimeFormat24h(timeDisplayObj.format24h);
    if (timeDisplayObj.showSeconds !== undefined) setShowSeconds(timeDisplayObj.showSeconds);
    
    if (timeDisplayObj.position !== undefined || timeDisplayObj.size !== undefined) {
      setTimeDisplay(prev => ({
        position: timeDisplayObj.position ?? prev.position,
        size: timeDisplayObj.size ?? prev.size
      }));
    }
    
    loadTimerSettings(timeDisplayObj.timer);
  }, [loadTimerSettings]);

  const loadDateSettings = useCallback((dateDisplayObj) => {
    if (!dateDisplayObj) return;
    if (dateDisplayObj.show !== undefined) setShowDate(dateDisplayObj.show);
    if (dateDisplayObj.enableCalendar !== undefined) setEnableCalendar(dateDisplayObj.enableCalendar);
    if (dateDisplayObj.firstDayOfWeek !== undefined) setFirstDayOfWeek(dateDisplayObj.firstDayOfWeek);
    if (dateDisplayObj.calendarEvents !== undefined) setCalendarEvents(dateDisplayObj.calendarEvents);
    
    if (dateDisplayObj.position !== undefined || dateDisplayObj.size !== undefined || dateDisplayObj.format !== undefined) {
      setDateDisplay(prev => ({
        position: dateDisplayObj.position ?? prev.position,
        size: dateDisplayObj.size ?? prev.size,
        format: dateDisplayObj.format ?? prev.format
      }));
    }
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('photoframeSettings');
    if (!savedSettings) return;
    
    try {
      const settings = JSON.parse(savedSettings);
      loadBasicSettings(settings);
      loadWeatherSettings(settings.weather);
      loadTimeSettings(settings.timeDisplay);
      loadDateSettings(settings.dateDisplay);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, [loadBasicSettings, loadWeatherSettings, loadTimeSettings, loadDateSettings]);

  // Reset settings to defaults
  const resetToDefaults = useCallback(() => {
    setShowDate(defaultConfig.dateDisplay.show);
    setShowTime(defaultConfig.timeDisplay.show);
    setShowImageCounter(defaultConfig.showImageCounter);
    setShowCountdown(defaultConfig.showCountdown);
    setCountdownPosition(defaultConfig.countdownPosition ?? "bottom-left");
    setImageCounterPosition(defaultConfig.imageCounterPosition ?? "bottom-right");
    setUiControlsPosition(defaultConfig.uiControlsPosition ?? "top-right");
    setLanguage(defaultConfig.language);
    setTheme(defaultConfig.theme);
    setRotationTime(defaultConfig.rotationTime);
    setTimeFormat24h(defaultConfig.timeDisplay.format24h);
    setShowSeconds(defaultConfig.timeDisplay.showSeconds);
    setImageDisplayMode(defaultConfig.imageDisplayMode);
    setSlideshowOrder(defaultConfig.slideshowOrder ?? 'sequential');
    
    setTimeDisplay({
      position: defaultConfig.timeDisplay.position,
      size: defaultConfig.timeDisplay.size
    });
    
    setDateDisplay({
      position: defaultConfig.dateDisplay.position,
      size: defaultConfig.dateDisplay.size,
      format: defaultConfig.dateDisplay.format
    });
    
    setEnableCalendar(defaultConfig.dateDisplay.enableCalendar);
    setFirstDayOfWeek(defaultConfig.dateDisplay.firstDayOfWeek || 0);
    setCalendarEvents(defaultConfig.dateDisplay?.calendarEvents ?? []);
    
    // Reset weather settings
    setShowWeather(defaultConfig.weather?.show ?? true);
    setWeatherLocation(defaultConfig.weather?.location ?? "Nice, France");
    setWeatherCoordinates(defaultConfig.weather?.coordinates ?? { lat: 43.7, lon: 7.25 });
    setForecastMode(defaultConfig.weather?.forecastMode ?? "smart");
    setWeatherPosition(defaultConfig.weather?.position ?? "top-right");
    setWeatherUnit(defaultConfig.weather?.unit ?? "metric");
    setWeatherSize(defaultConfig.weather?.size ?? "size-2");
    setWeatherRefreshInterval(defaultConfig.weather?.refreshInterval ?? 60);
    setShowWeatherCountdown(defaultConfig.weather?.showCountdown ?? false);
    setShowAirQuality(defaultConfig.weather?.showAirQuality ?? false);
    
    // Reset timer settings
    setTimerEnabled(defaultConfig.timeDisplay?.timer?.enabled ?? false);
    setTimerType(defaultConfig.timeDisplay?.timer?.type ?? 'countdown');
    setCountdownHours(defaultConfig.timeDisplay?.timer?.countdownHours ?? 0);
    setCountdownMinutes(defaultConfig.timeDisplay?.timer?.countdownMinutes ?? 5);
    setCountdownSeconds(defaultConfig.timeDisplay?.timer?.countdownSeconds ?? 0);
    setTimerTimeoutBlinkDuration(defaultConfig.timeDisplay?.timer?.timeoutBlinkDuration ?? 10);
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    const settings = {
      language,
      theme,
      imageDisplayMode,
      showImageCounter,
      showCountdown,
      countdownPosition,
      imageCounterPosition,
      uiControlsPosition,
      rotationTime,
      slideshowOrder,
      weather: {
        show: showWeather,
        location: weatherLocation,
        coordinates: weatherCoordinates,
        forecastMode,
        position: weatherPosition,
        unit: weatherUnit,
        size: weatherSize,
        refreshInterval: weatherRefreshInterval,
        showCountdown: showWeatherCountdown,
        showAirQuality: showAirQuality
      },
      timeDisplay: {
        show: showTime,
        format24h: timeFormat24h,
        showSeconds,
        position: timeDisplay.position,
        size: timeDisplay.size,
        timer: {
          enabled: timerEnabled,
          type: timerType,
          countdownHours,
          countdownMinutes,
          countdownSeconds,
          timeoutBlinkDuration: timerTimeoutBlinkDuration,
          countdownFontSize,
          chronometerFontSize,
          position: "below"
        }
      },
      dateDisplay: {
        show: showDate,
        format: dateDisplay.format,
        position: dateDisplay.position,
        size: dateDisplay.size,
        enableCalendar,
        firstDayOfWeek,
        calendarEvents
      }
    };
    
    localStorage.setItem('photoframeSettings', JSON.stringify(settings));
  }, [
    language, theme, imageDisplayMode, showImageCounter, showCountdown, countdownPosition, imageCounterPosition, uiControlsPosition, rotationTime, slideshowOrder,
    showWeather, weatherLocation, weatherCoordinates, forecastMode, weatherPosition,
    weatherUnit, weatherSize, weatherRefreshInterval, showWeatherCountdown, showAirQuality,
    showTime, timeFormat24h, showSeconds, timeDisplay, timerEnabled, timerType,
    countdownHours, countdownMinutes, countdownSeconds, timerTimeoutBlinkDuration,
    countdownFontSize, chronometerFontSize,
    showDate, dateDisplay, enableCalendar, firstDayOfWeek, calendarEvents
  ]);

  // Validation wrapper for rotationTime
  const setValidatedRotationTime = useCallback((value) => {
    const clampedValue = Math.max(10, Math.min(7200, value)); // 10 seconds to 120 minutes
    setRotationTime(clampedValue);
  }, []);

  return {
    // Basic settings
    showDate, setShowDate,
    showTime, setShowTime,
    enableCalendar, setEnableCalendar,
    firstDayOfWeek, setFirstDayOfWeek,
    showImageCounter, setShowImageCounter,
    showCountdown, setShowCountdown,
    countdownPosition, setCountdownPosition,
    imageCounterPosition, setImageCounterPosition,
    uiControlsPosition, setUiControlsPosition,
    language, setLanguage,
    theme, setTheme,
    rotationTime, setRotationTime: setValidatedRotationTime,
    timeFormat24h, setTimeFormat24h,
    showSeconds, setShowSeconds,
    imageDisplayMode, setImageDisplayMode,
    slideshowOrder, setSlideshowOrder,
    
    // Display settings
    timeDisplay, setTimeDisplay,
    dateDisplay, setDateDisplay,
    calendarEvents, setCalendarEvents,
    
    // Timer settings
    timerEnabled, setTimerEnabled,
    timerType, setTimerType,
    countdownHours, setCountdownHours,
    countdownMinutes, setCountdownMinutes,
    countdownSeconds, setCountdownSeconds,
    timerTimeoutBlinkDuration, setTimerTimeoutBlinkDuration,
    countdownFontSize, setCountdownFontSize,
    chronometerFontSize, setChronometerFontSize,
    
    // Weather settings
    showWeather, setShowWeather,
    weatherLocation, setWeatherLocation,
    weatherCoordinates, setWeatherCoordinates,
    forecastMode, setForecastMode,
    weatherPosition, setWeatherPosition,
    weatherUnit, setWeatherUnit,
    weatherSize, setWeatherSize,
    weatherRefreshInterval, setWeatherRefreshInterval,
    showWeatherCountdown, setShowWeatherCountdown,
    showAirQuality, setShowAirQuality,
    
    // Actions
    resetToDefaults,
    saveSettings
  };
};
