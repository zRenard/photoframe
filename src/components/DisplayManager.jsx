import React, { memo, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CalendarIcon } from '@heroicons/react/24/outline';
import WeatherDisplay from './WeatherDisplay';
import TimerDisplay from './TimerDisplay';
import { useTimer } from '../hooks/useTimer';

/**
 * DisplayManager - Handles unified positioning of time, date, and weather displays
 * This component replicates the complex positioning logic from the original App.jsx
 */
const DisplayManager = memo(({ 
  // Time settings
  showTime,
  timeDisplay,
  timeFormat24h,
  showSeconds,
  
  // Date settings
  showDate,
  dateDisplay,
  enableCalendar,
  onCalendarClick,
  
  // Weather settings
  showWeather,
  weatherLocation,
  weatherCoordinates,
  forecastMode,
  weatherUnit,
  weatherPosition,
  weatherSize,
  weatherRefreshInterval,
  showWeatherCountdown,
  showAirQuality,
  
  // Timer settings
  timerEnabled,
  timerType,
  countdownHours,
  countdownMinutes,
  countdownSeconds,
  timerTimeoutBlinkDuration,
  countdownFontSize,
  chronometerFontSize,
  onTimerTypeChange,
  
  // Common
  language,
  translations
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Timer hook
  const timerData = useTimer(
    countdownHours,
    countdownMinutes, 
    countdownSeconds,
    timerType,
    timerTimeoutBlinkDuration
  );

  // Position classes mapping
  const positionClasses = useMemo(() => ({
    'top-left': 'absolute top-4 left-4',
    'top-center': 'absolute top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'absolute top-4 right-4',
    'center-left': 'absolute top-1/2 left-4 transform -translate-y-1/2',
    'center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'center-right': 'absolute top-1/2 right-4 transform -translate-y-1/2',
    'bottom-left': 'absolute bottom-4 left-4',
    'bottom-center': 'absolute bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'absolute bottom-4 right-4'
  }), []);

  // Time sizes mapping
  const timeSizes = useMemo(() => ({
    'size-1': 'text-[3rem]',
    'size-2': 'text-[4.7rem]',
    'size-3': 'text-[6.4rem]',
    'size-4': 'text-[8.1rem]',
    'size-5': 'text-[9.8rem]',
    'size-6': 'text-[11.5rem]',
    'size-7': 'text-[13.2rem]',
    'size-8': 'text-[15rem]'
  }), []);

  // Date sizes mapping
  const dateSizes = useMemo(() => ({
    'size-1': 'text-lg',
    'size-2': 'text-xl',
    'size-3': 'text-2xl',
    'size-4': 'text-3xl',
    'size-5': 'text-4xl',
    'size-6': 'text-5xl',
    'size-7': 'text-6xl',
    'size-8': 'text-7xl'
  }), []);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeOptions = {
        hour12: !timeFormat24h,
        hour: '2-digit',
        minute: '2-digit'
      };
      
      if (showSeconds) {
        timeOptions.second = '2-digit';
      }
      
      setCurrentTime(now.toLocaleTimeString(language, timeOptions));

      // Update date less frequently
      const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setCurrentDate(now.toLocaleDateString(language, dateOptions));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeFormat24h, showSeconds, language]);

  // Render unified time and date display when they share the same position
  const renderUnifiedTimeDate = () => {
    const hasWeatherAtSamePosition = showWeather && weatherPosition === timeDisplay.position;
    
    return (
      <div className={`time-display ${positionClasses[timeDisplay.position]} z-10 bg-black bg-opacity-50 text-white p-4 rounded-lg transition-all duration-300`}>
        {/* Time Display */}
        <div className="time-section">
          <div className={`${timeSizes[timeDisplay.size]} font-bold text-center relative flex items-center justify-center gap-2`}>
            {currentTime}
            {/* Timer Icon - positioned next to time, this manages all timer logic */}
            {timerEnabled && (
              <TimerDisplay
                key="timer-icon"
                enabled={timerEnabled}
                type={timerType}
                initialHours={countdownHours}
                initialMinutes={countdownMinutes}
                initialSeconds={countdownSeconds}
                position="icon"
                language={language}
                translations={translations}
                timeoutBlinkDuration={timerTimeoutBlinkDuration}
                countdownFontSize={countdownFontSize}
                chronometerFontSize={chronometerFontSize}
                showIconButton={true}
                onTimerTypeChange={onTimerTypeChange}
                // Pass timer state
                isActive={timerData.timerIsActive}
                isPaused={timerData.timerIsPaused}
                isComplete={timerData.timerIsComplete}
                isHidden={timerData.timerIsHidden}
                timerTime={timerData.timerTime}
                timerBlinkClass={timerData.timerBlinkClass}
                onTimerStateChange={{
                  setIsActive: timerData.setTimerIsActive,
                  setIsPaused: timerData.setTimerIsPaused,
                  setIsComplete: timerData.setTimerIsComplete,
                  setIsHidden: timerData.setTimerIsHidden,
                  setTime: timerData.setTimeManually,
                  setBlinkClass: timerData.setTimerBlinkClass,
                  toggleTimer: timerData.toggleTimer,
                  startTimer: timerData.startTimer,
                  resetTimer: timerData.resetTimer,
                  getLastPopupValues: timerData.getLastPopupValues,
                  updateLastPopupValues: timerData.updateLastPopupValues
                }}
              />
            )}
          </div>
          
          {/* Timer Display - always rendered below time, reflects shared timer state */}
          {timerEnabled && !timerData.timerIsHidden && (
            <div className="timer-below-time mt-2 flex justify-center">
              <TimerDisplay
                key="timer-below"
                enabled={timerEnabled}
                type={timerType}
                initialHours={countdownHours}
                initialMinutes={countdownMinutes}
                initialSeconds={countdownSeconds}
                position="below"
                language={language}
                translations={translations}
                timeoutBlinkDuration={timerTimeoutBlinkDuration}
                countdownFontSize={countdownFontSize}
                chronometerFontSize={chronometerFontSize}
                showIconButton={false}
                onTimerTypeChange={onTimerTypeChange}
                // Pass timer state - but this component won't manage state changes
                isActive={timerData.timerIsActive}
                isPaused={timerData.timerIsPaused}
                isComplete={timerData.timerIsComplete}
                isHidden={timerData.timerIsHidden}
                timerTime={timerData.timerTime}
                timerBlinkClass={timerData.timerBlinkClass}
                onTimerStateChange={{
                  setIsActive: timerData.setTimerIsActive,
                  setIsPaused: timerData.setTimerIsPaused,
                  setIsComplete: timerData.setTimerIsComplete,
                  setIsHidden: timerData.setTimerIsHidden,
                  setTime: timerData.setTimeManually,
                  setBlinkClass: timerData.setTimerBlinkClass,
                  toggleTimer: timerData.toggleTimer,
                  startTimer: timerData.startTimer,
                  resetTimer: timerData.resetTimer,
                  getLastPopupValues: timerData.getLastPopupValues,
                  updateLastPopupValues: timerData.updateLastPopupValues
                }}
              />
            </div>
          )}
        </div>
        
        {/* Date Display - When same position as time */}
        {showDate && timeDisplay.position === dateDisplay.position && (
          <div className="mt-2">
            <div className="flex items-center justify-center">
              <div className={`${dateSizes[dateDisplay.size]} font-medium text-center`}>
                {currentDate}
              </div>
              {enableCalendar && (
                <button 
                  className="ml-2 text-white hover:text-blue-300 cursor-pointer p-1 rounded-full flex items-center justify-center transition-colors" 
                  onClick={onCalendarClick}
                  aria-label="Open calendar"
                  type="button"
                >
                  <CalendarIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Weather Display - When same position as time */}
        {hasWeatherAtSamePosition && (
          <div className="weather-with-time mt-3 pt-3 border-t border-gray-500">
            <WeatherDisplay
              location={weatherLocation}
              coordinates={weatherCoordinates}
              forecastMode={forecastMode}
              unit={weatherUnit}
              position={weatherPosition}
              language={language}
              translations={translations}
              size={weatherSize}
              refreshInterval={weatherRefreshInterval}
              showRefreshCountdown={showWeatherCountdown}
              showAirQuality={showAirQuality}
              isUnified={true}
            />
          </div>
        )}
      </div>
    );
  };

  // Render standalone date display when different position than time
  const renderStandaloneDate = () => {
    const hasWeatherAtSamePosition = showWeather && weatherPosition === dateDisplay.position;
    
    return (
      <div className={`date-display ${positionClasses[dateDisplay.position]} z-10 bg-black bg-opacity-50 text-white p-3 rounded-lg transition-all duration-300`}>
        <div className="flex items-center justify-center">
          <div className={`${dateSizes[dateDisplay.size]} font-medium text-center`}>
            {currentDate}
          </div>
          {enableCalendar && (
            <button 
              className="ml-2 text-white hover:text-blue-300 cursor-pointer p-1 rounded-full flex items-center justify-center transition-colors" 
              onClick={onCalendarClick}
              aria-label="Open calendar"
              type="button"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Weather Display - When same position as date but not time */}
        {hasWeatherAtSamePosition && (!showTime || timeDisplay.position !== dateDisplay.position) && (
          <div className="weather-with-date mt-3 pt-3 border-t border-gray-500">
            <WeatherDisplay
              location={weatherLocation}
              coordinates={weatherCoordinates}
              forecastMode={forecastMode}
              unit={weatherUnit}
              position={weatherPosition}
              language={language}
              translations={translations}
              size={weatherSize}
              refreshInterval={weatherRefreshInterval}
              showRefreshCountdown={showWeatherCountdown}
              showAirQuality={showAirQuality}
              isUnified={true}
            />
          </div>
        )}
      </div>
    );
  };

  // Render standalone weather display when not sharing position
  const renderStandaloneWeather = () => {
    return (
      <WeatherDisplay
        location={weatherLocation}
        coordinates={weatherCoordinates}
        forecastMode={forecastMode}
        unit={weatherUnit}
        position={weatherPosition}
        language={language}
        translations={translations}
        size={weatherSize}
        refreshInterval={weatherRefreshInterval}
        showRefreshCountdown={showWeatherCountdown}
        showAirQuality={showAirQuality}
        isUnified={false}
      />
    );
  };

  return (
    <>
      {/* Unified Time Display (includes date and weather when they share positions) */}
      {showTime && renderUnifiedTimeDate()}
      
      {/* Standalone Date Display - When different position than time and not unified with weather */}
      {showDate && 
       (!showTime || timeDisplay.position !== dateDisplay.position) && 
       !(showWeather && showTime && timeDisplay.position === dateDisplay.position && dateDisplay.position === weatherPosition) && 
       renderStandaloneDate()}
      
      {/* Standalone Weather Display - Only when not sharing position with time or date */}
      {showWeather && 
       !(showTime && weatherPosition === timeDisplay.position) && 
       !(showDate && weatherPosition === dateDisplay.position) && 
       renderStandaloneWeather()}
    </>
  );
});

DisplayManager.displayName = 'DisplayManager';

DisplayManager.propTypes = {
  // Time settings
  showTime: PropTypes.bool.isRequired,
  timeDisplay: PropTypes.shape({
    position: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired
  }).isRequired,
  timeFormat24h: PropTypes.bool.isRequired,
  showSeconds: PropTypes.bool.isRequired,
  
  // Date settings
  showDate: PropTypes.bool.isRequired,
  dateDisplay: PropTypes.shape({
    position: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired
  }).isRequired,
  enableCalendar: PropTypes.bool,
  onCalendarClick: PropTypes.func,
  
  // Weather settings
  showWeather: PropTypes.bool.isRequired,
  weatherLocation: PropTypes.string,
  weatherCoordinates: PropTypes.object,
  forecastMode: PropTypes.string,
  weatherUnit: PropTypes.string,
  weatherPosition: PropTypes.string,
  weatherSize: PropTypes.string,
  weatherRefreshInterval: PropTypes.number,
  showWeatherCountdown: PropTypes.bool,
  showAirQuality: PropTypes.bool,
  
  // Timer settings
  timerEnabled: PropTypes.bool,
  timerType: PropTypes.string,
  countdownHours: PropTypes.number,
  countdownMinutes: PropTypes.number,
  countdownSeconds: PropTypes.number,
  timerTimeoutBlinkDuration: PropTypes.number,
  countdownFontSize: PropTypes.oneOf(['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7', 'size-8']),
  chronometerFontSize: PropTypes.oneOf(['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7', 'size-8']),
  onTimerTypeChange: PropTypes.func,
  
  // Common
  language: PropTypes.string,
  translations: PropTypes.object
};

export default DisplayManager;
