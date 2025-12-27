import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ClockIcon, PauseIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';

// Timer font sizes definition - maps size keys to CSS classes
const timerFontSizes = {
  'size-1': 'text-sm',
  'size-2': 'text-base',
  'size-3': 'text-lg',
  'size-4': 'text-xl',
  'size-5': 'text-2xl',
  'size-6': 'text-3xl',
  'size-7': 'text-4xl',
  'size-8': 'text-5xl'
};

const TimerDisplay = ({ 
  enabled = false, 
  type = 'countdown', // 'countdown' or 'chronometer'
  initialHours = 0,
  initialMinutes = 5,
  initialSeconds = 0,
  position = 'below',
  language = 'en',
  translations,
  _onComplete = null,
  showIconButton = true,
  onTimerTypeChange = null,
  _timeoutBlinkDuration = 10, // Default to 10 seconds if not provided
  countdownFontSize = 'size-4', // Font size for countdown timer
  chronometerFontSize = 'size-4', // Font size for chronometer timer
  // Shared timer state props
  isActive: externalIsActive,
  isPaused: externalIsPaused,
  isComplete: externalIsComplete,
  isHidden: externalIsHidden,
  timerTime: externalTimerTime,
  timerBlinkClass: externalBlinkClass,
  onTimerStateChange = null
}) => {
  // Use external state if provided, otherwise use internal state
  const hasExternalState = onTimerStateChange !== null;
  
  // Internal state (fallback when no external state is provided)
  const [internalIsActive, setInternalIsActive] = useState(false);
  const [internalIsPaused, setInternalIsPaused] = useState(false);
  const [internalIsComplete, setInternalIsComplete] = useState(false);
  const [internalTime, setInternalTime] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds
  });
  
  // Use external or internal state
  const isActive = hasExternalState ? externalIsActive : internalIsActive;
  const isPaused = hasExternalState ? externalIsPaused : internalIsPaused;
  const isComplete = hasExternalState ? externalIsComplete : internalIsComplete;
  const isHidden = hasExternalState ? externalIsHidden : false; // Default to false for internal state
  // Always use externalTimerTime for display and logic when in external state mode
  const time = hasExternalState ? externalTimerTime : internalTime;
  
  // State setters
  const setIsActive = hasExternalState ? onTimerStateChange.setIsActive : setInternalIsActive;
  const setIsPaused = hasExternalState ? onTimerStateChange.setIsPaused : setInternalIsPaused;
  const setIsComplete = hasExternalState ? onTimerStateChange.setIsComplete : setInternalIsComplete;
  const setTime = hasExternalState ? onTimerStateChange.setTime : setInternalTime;
  // Other state variables that are not shared
  const [showSettings, setShowSettings] = useState(false);
  const [configTimeManuallySet, setConfigTimeManuallySet] = useState(false);
  const [isFirstTimeOpeningPopup, setIsFirstTimeOpeningPopup] = useState(true);
  
  // Use shared popup values if external state is available, otherwise use local state
  const [localLastPopupValues, setLocalLastPopupValues] = useState({
    hours: 0,
    minutes: 5,
    seconds: 0
  });
  
  const getLastPopupValues = hasExternalState && onTimerStateChange?.getLastPopupValues 
    ? onTimerStateChange.getLastPopupValues 
    : () => localLastPopupValues;
  
  const updateLastPopupValues = hasExternalState && onTimerStateChange?.updateLastPopupValues 
    ? onTimerStateChange.updateLastPopupValues 
    : setLocalLastPopupValues;
  
  // For countdown configuration
  const [configTime, setConfigTime] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds
  });
  
  const [blinkClass, setBlinkClass] = useState('');
  const intervalRef = useRef(null);
  
  // Use external blink state if available, otherwise use internal
  const actualBlinkClass = hasExternalState ? externalBlinkClass : blinkClass;
  const setActualBlinkClass = hasExternalState ? onTimerStateChange.setBlinkClass : setBlinkClass;
  const settingsRef = useRef(null);
  
  // Translation helper
  const t = translations?.[language] || translations.en;

  // Get className for timer panel, adding blink class when needed
  const getTimerPanelClassName = () => {
    const baseClasses = "timer-content flex items-center space-x-2 text-white bg-black bg-opacity-50 p-2 rounded";
    if (actualBlinkClass) {
      const finalClassName = `${baseClasses} ${actualBlinkClass}`;
      return finalClassName;
    }
    return baseClasses;
  };

  // Get the appropriate font size based on timer type
  const getFontSizeClass = () => {
    const fontSize = type === 'countdown' ? countdownFontSize : chronometerFontSize;
    return timerFontSizes[fontSize] || 'text-lg';
  };

  // Start/pause timer
  const toggleTimer = () => {
    // Use external toggle method if available
    if (hasExternalState && onTimerStateChange?.toggleTimer) {
      // If starting fresh, make sure to set the correct initial time
      if (!isActive && !isPaused) {
        let newTime;
        if (type === 'countdown') {
          newTime = configTime;
        } else {
          newTime = { hours: 0, minutes: 0, seconds: 0 };
        }
        if (onTimerStateChange.setTime) {
          onTimerStateChange.setTime(newTime);
        }
      }
      
      onTimerStateChange.toggleTimer();
      setShowSettings(false);
      return;
    }
    
    // Fallback to internal logic (when no external state)
    if (!isActive) {
      // Starting or resuming timer
      if (!isPaused) {
        // Starting fresh - initialize time based on type
        if (type === 'countdown') {
          setTime(configTime);
        } else {
          // Start chronometer from 00:00:00
          setTime({ hours: 0, minutes: 0, seconds: 0 });
        }
      }
      
      setIsActive(true);
      setIsPaused(false);
      setIsComplete(false);
      setActualBlinkClass('');
      
      // Only create interval if this component manages its own state
      if (!hasExternalState) {
        // Note: When using external state, the useTimer hook manages intervals
        // We don't need to create intervals here anymore
      }
    } else {
      // Pausing timer
      if (!hasExternalState) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsActive(false);
      setIsPaused(true);
    }
    
    // Hide settings when starting
    setShowSettings(false);
  };

  // Reset timer
  const resetTimer = () => {
    // Use external reset method if available
    if (hasExternalState && onTimerStateChange?.resetTimer) {
      onTimerStateChange.resetTimer();
      return;
    }
    
    // Fallback to internal logic (when no external state)
    if (!hasExternalState) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Clear blinking effect
    setActualBlinkClass('');
    
    setIsActive(false);
    setIsPaused(false);
    setIsComplete(false);
    setActualBlinkClass('');
    
    // Don't reset configTimeManuallySet - keep popup values persistent
    
    if (type === 'countdown') {
      setTime(configTime);
    } else {
      setTime({
        hours: 0,
        minutes: 0,
        seconds: 0
      });
    }
  };
  
  // Show/hide settings panel
  const toggleSettings = () => {
    if (!showSettings) {
      // Opening the popup - show last used values, or defaults if first time
      const lastValues = getLastPopupValues();
      
      if (isFirstTimeOpeningPopup) {
        setConfigTime({
          hours: 0,
          minutes: 5,
          seconds: 0
        });
        setIsFirstTimeOpeningPopup(false);
      } else {
        // Show the last popup values that were used
        setConfigTime(lastValues);
      }
    }
    setShowSettings(!showSettings);
  };
  
  // Apply settings and start timer
  const applyAndStartTimer = () => {
    let newTime;
    if (type === 'countdown') {
      newTime = {
        hours: configTime.hours,
        minutes: configTime.minutes,
        seconds: configTime.seconds
      };
      // Save these values as the last used popup values
      updateLastPopupValues(newTime);
    } else {
      newTime = { hours: 0, minutes: 0, seconds: 0 };
    }
    // Mark that the user has manually set config time
    setConfigTimeManuallySet(true);
    setShowSettings(false);
    // Use external state if available
    if (hasExternalState && onTimerStateChange?.setTime) {
      onTimerStateChange.setTime(newTime);
      // Use startTimer instead of setIsActive + toggleTimer to avoid conflicts
      if (onTimerStateChange.startTimer) {
        onTimerStateChange.startTimer();
      } else if (onTimerStateChange.toggleTimer) {
        onTimerStateChange.toggleTimer();
      }
      return;
    }
    // Fallback to internal logic
    setTime(newTime);
    setIsActive(true);
    setIsPaused(false);
    setIsComplete(false);
    setActualBlinkClass('');
  };

  // Reset to default values (5 minutes)
  const resetToDefaults = () => {
    const defaultValues = {
      hours: 0,
      minutes: 5,
      seconds: 0
    };
    setConfigTime(defaultValues);
    // Update the last popup values to the defaults
    updateLastPopupValues(defaultValues);
  };
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    // Convert to number and ensure it's a valid number
    const numValue = parseInt(value, 10) || 0;
    
    // Apply constraints based on the field
    let constrainedValue = numValue;
    if (field === 'hours') {
      constrainedValue = Math.min(Math.max(numValue, 0), 99);
    } else {
      constrainedValue = Math.min(Math.max(numValue, 0), 59);
    }
    
    setConfigTime(prev => ({
      ...prev,
      [field]: constrainedValue
    }));
    
    // Mark that the user has manually set config time
    setConfigTimeManuallySet(true);
  };
  

  // Cleanup interval on unmount (only if not using external state)
  useEffect(() => {
    if (hasExternalState) return;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hasExternalState]);

  // Clear interval when timer is paused (from any component, only if not using external state)
  useEffect(() => {
    if (hasExternalState) return;
    if (isPaused && intervalRef.current && (position === 'icon' || !hasExternalState)) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPaused, position, hasExternalState]);

  // Cleanup interval on unmount (only if not using external state)
  useEffect(() => {
    if (hasExternalState) return;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasExternalState]);
  
  // Click outside to close settings panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);
  
  // Update timer display when initial values change
  useEffect(() => {
    // Always update when timer is not active, regardless of paused state
    // This ensures countdown values are always applied when timer is stopped
    // But only update configTime if it hasn't been manually set by the user
    if (!isActive) {
      setTime({
        hours: initialHours,
        minutes: initialMinutes,
        seconds: initialSeconds
      });
      
      // Only update configTime if user hasn't manually set custom values
      if (!configTimeManuallySet) {
        setConfigTime({
          hours: initialHours,
          minutes: initialMinutes,
          seconds: initialSeconds
        });
      }
    }
  }, [initialHours, initialMinutes, initialSeconds, isActive, setTime, configTimeManuallySet]);
  
  // Format time display with localization
  const formatTime = useCallback((hours, minutes, seconds) => {
    // Create a date object with the time components
    // Using a fixed date (epoch) and only setting time components
    const date = new Date(0);
    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    date.setUTCSeconds(seconds);
    
    try {
      // Use the browser's localization for time formatting
      const timeString = date.toLocaleTimeString(language, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC' // Use UTC to avoid timezone conversion
      });
      return timeString;
    } catch {
      // Fallback to manual formatting if localization fails
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, [language]);
    // Only return null if the timer is completely inactive and disabled
  // This ensures the timer continues to be displayed when active, even if disabled in settings
  // Note: isHidden only affects "below" position, not the icon
  if (!enabled && !isActive && !isPaused && !isComplete && !showSettings) {
    return null;
  }

  // For "below" position - only show when timer is active, paused, or complete (display-only)
  // AND not hidden (isHidden only applies to below position)
  if (position === 'below') {
    if ((!isActive && !isPaused && !isComplete) || isHidden) {
      return null; // Don't show anything when timer is not running or is hidden
    }
    
    return (
      <div className="timer-display-below">
        <div className={getTimerPanelClassName()}>
          <div className={`timer-time ${getFontSizeClass()} font-bold text-white mr-2`}>
            {isComplete ? (t.timeOut || 'Time Out') : formatTime(time.hours, time.minutes, time.seconds)}
          </div>
          {/* Timer Controls - Hide when timer is complete */}
          {!isComplete && (
            <div className="timer-controls flex space-x-1">
              <button
                onClick={toggleTimer}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                title={isActive ? t.pause || 'Pause' : t.start || 'Start'}
              >
                {isActive ? 
                  <PauseIcon className="h-4 w-4 text-white" /> : 
                  <PlayIcon className="h-4 w-4 text-white" />
                }
              </button>
              <button
                onClick={resetTimer}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                title={t.reset || 'Reset'}
              >
                <StopIcon className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For icon position, show just the icon and settings panel
  if (position === 'icon' && showIconButton) {
    // Always show just the icon (the actual timer display is handled by the "below" position)
    if (!showSettings) {
      return (
        <div className="relative">
          <button
            onClick={toggleSettings}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            title={t.timer || 'Timer'}
          >
            <ClockIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      );
    }
    
    // Show settings panel when icon is clicked
    return (
      <div className="relative">
        <button
          onClick={toggleSettings}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
          title={t.timer || 'Timer'}
        >
          <ClockIcon className="h-5 w-5 text-white" />
        </button>
        
        {/* Settings Panel for icon position */}
        {showSettings && (
          <div 
            ref={settingsRef}
            className="settings-panel absolute z-20 bg-black/80 rounded-lg p-2 shadow-lg w-80"
            style={{ top: '100%', marginTop: '8px', left: '50%', transform: 'translateX(-50%)' }}
          >
            <h3 className="text-xs font-medium mb-1">{t.timer || 'Timer'}</h3>
            
            <div className="mb-1">
              <label className="flex items-center space-x-1 mb-0.5 text-xs">
                <input
                  type="radio"
                  checked={type === 'countdown'}
                  onChange={() => {
                    if (onTimerTypeChange) {
                      onTimerTypeChange('countdown');
                    }
                  }}
                  className="form-radio h-3 w-3"
                />
                <span>{t.countdown || 'Countdown'}</span>
              </label>
              <label className="flex items-center space-x-1 text-xs">
                <input
                  type="radio"
                  checked={type === 'chronometer'}
                  onChange={() => {
                    if (onTimerTypeChange) {
                      onTimerTypeChange('chronometer');
                    }
                  }}
                  className="form-radio h-3 w-3"
                />
                <span>{t.chronometer || 'Chronometer'}</span>
              </label>
            </div>
            
            {type === 'countdown' && (
              <div className="mb-1">
                <h4 className="text-xs font-medium mb-0.5">{t.countdownSettings || 'Countdown Settings'}</h4>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs">H:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={configTime.hours}
                    onChange={(e) => handleInputChange('hours', e.target.value)}
                    className="w-12 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                  />
                  <span className="text-xs">M:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={configTime.minutes}
                    onChange={(e) => handleInputChange('minutes', e.target.value)}
                    className="w-12 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                  />
                  <span className="text-xs">S:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={configTime.seconds}
                    onChange={(e) => handleInputChange('seconds', e.target.value)}
                    className="w-12 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-1 gap-1">
              <button 
                onClick={() => setShowSettings(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-0.5 px-2 rounded text-xs"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button 
                onClick={resetToDefaults}
                className="bg-blue-600 hover:bg-blue-700 text-white py-0.5 px-2 rounded text-xs"
              >
                {t.reset || 'Reset'}
              </button>
              <button 
                onClick={applyAndStartTimer}
                className="bg-green-600 hover:bg-green-700 text-white py-0.5 px-2 rounded text-xs"
              >
                {t.start || 'Start'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`timer-display flex items-center justify-center`}>
      {/* Timer Display - Show only when active/paused/complete */}
      {(isActive || isPaused || isComplete) && (
        <div 
          className={getTimerPanelClassName()}
        >
          <div className="timer-time text-xl font-bold text-white">
            {isComplete ? (t.timeOut || 'Time Out') : formatTime(time.hours, time.minutes, time.seconds)}
          </div>
          {/* Timer Controls - Hide when timer is complete */}
          {!isComplete && (
            <div className="timer-controls flex space-x-1">
              <button
                onClick={toggleTimer}
                className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                title={isActive ? t.pause || 'Pause' : t.start || 'Start'}
              >
                {isActive ? 
                  <PauseIcon className="h-3 w-3 text-white" /> : 
                  <PlayIcon className="h-3 w-3 text-white" />
                }
              </button>
              <button
                onClick={resetTimer}
                className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                title={t.reset || 'Reset'}
              >
                <StopIcon className="h-3 w-3 text-white" />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <div 
          ref={settingsRef}
          className="settings-panel absolute z-20 bg-black/80 rounded-lg p-2 shadow-lg w-80"
          style={{ top: position === 'below' ? '100%' : '0', marginTop: position === 'below' ? '4px' : '0' }}
        >
          <h3 className="text-xs font-medium mb-1">{t.timer || 'Timer'}</h3>
          
          <div className="mb-1">
            <label className="flex items-center space-x-1 mb-0.5 text-xs">
              <input
                type="radio"
                checked={type === 'countdown'}
                onChange={() => {
                  // This is a prop, so we need to call any callback provided by parent
                  if (onTimerTypeChange) {
                    onTimerTypeChange('countdown');
                  }
                }}
                className="form-radio h-3 w-3"
              />
              <span>{t.countdown || 'Countdown'}</span>
            </label>
            <label className="flex items-center space-x-1 text-xs">
              <input
                type="radio"
                checked={type === 'chronometer'}
                onChange={() => {
                  // This is a prop, so we need to call any callback provided by parent
                  if (onTimerTypeChange) {
                    onTimerTypeChange('chronometer');
                  }
                }}
                className="form-radio h-3 w-3"
              />
              <span>{t.chronometer || 'Chronometer'}</span>
            </label>
          </div>
          
          {type === 'countdown' && (
            <div className="mb-1">
              <h4 className="text-xs font-medium mb-0.5">{t.countdownSettings || 'Countdown Settings'}</h4>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs">H:</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={configTime.hours}
                  onChange={(e) => handleInputChange('hours', e.target.value)}
                  className="w-12 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                />
                <span className="text-xs">M:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={configTime.minutes}
                  onChange={(e) => handleInputChange('minutes', e.target.value)}
                  className="w-12 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                />
                <span className="text-xs">S:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={configTime.seconds}
                  onChange={(e) => handleInputChange('seconds', e.target.value)}
                  className="w-12 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-1 gap-1">
            <button 
              onClick={() => setShowSettings(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-0.5 px-2 rounded text-xs"
            >
              {t.cancel || 'Cancel'}
            </button>
            <button 
              onClick={resetToDefaults}
              className="bg-blue-600 hover:bg-blue-700 text-white py-0.5 px-2 rounded text-xs"
            >
              {t.reset || 'Reset'}
            </button>
            <button 
              onClick={applyAndStartTimer}
              className="bg-green-600 hover:bg-green-700 text-white py-0.5 px-2 rounded text-xs"
            >
              {t.start || 'Start'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

TimerDisplay.propTypes = {
  enabled: PropTypes.bool,
  type: PropTypes.oneOf(['countdown', 'chronometer']),
  initialHours: PropTypes.number,
  initialMinutes: PropTypes.number,
  initialSeconds: PropTypes.number,
  position: PropTypes.oneOf(['below', 'right', 'icon']),
  language: PropTypes.string,
  translations: PropTypes.object.isRequired,
  onComplete: PropTypes.func,
  showIconButton: PropTypes.bool,
  onTimerTypeChange: PropTypes.func,
  timeoutBlinkDuration: PropTypes.number,
  countdownFontSize: PropTypes.oneOf(['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7', 'size-8']),
  chronometerFontSize: PropTypes.oneOf(['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7', 'size-8']),
  // Shared timer state props
  isActive: PropTypes.bool,
  isPaused: PropTypes.bool,
  isComplete: PropTypes.bool,
  isHidden: PropTypes.bool,
  timerTime: PropTypes.shape({
    hours: PropTypes.number,
    minutes: PropTypes.number,
    seconds: PropTypes.number
  }),
  timerBlinkClass: PropTypes.string,
  onTimerStateChange: PropTypes.shape({
    setIsActive: PropTypes.func,
    setIsPaused: PropTypes.func,
    setIsComplete: PropTypes.func,
    setIsHidden: PropTypes.func,
    setTime: PropTypes.func,
    setBlinkClass: PropTypes.func,
    toggleTimer: PropTypes.func,
    startTimer: PropTypes.func,
    resetTimer: PropTypes.func,
    getLastPopupValues: PropTypes.func,
    updateLastPopupValues: PropTypes.func
  })
};

export default TimerDisplay;
