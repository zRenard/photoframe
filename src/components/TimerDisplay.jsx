import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ClockIcon, PauseIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';

const TimerDisplay = ({ 
  enabled = false, 
  type = 'countdown', // 'countdown' or 'chronometer'
  initialHours = 0,
  initialMinutes = 5,
  initialSeconds = 0,
  position = 'below',
  language = 'en',
  translations,
  onComplete = null,
  showIconButton = true,
  onTimerTypeChange = null,
  timeoutBlinkDuration = 10, // Default to 10 seconds if not provided
  debug = false, // Debug mode flag
  // Shared timer state props
  isActive: externalIsActive,
  isPaused: externalIsPaused,
  isComplete: externalIsComplete,
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
  const time = hasExternalState ? externalTimerTime : internalTime;
  
  // State setters
  const setIsActive = hasExternalState ? onTimerStateChange.setIsActive : setInternalIsActive;
  const setIsPaused = hasExternalState ? onTimerStateChange.setIsPaused : setInternalIsPaused;
  const setIsComplete = hasExternalState ? onTimerStateChange.setIsComplete : setInternalIsComplete;
  const setTime = hasExternalState ? onTimerStateChange.setTime : setInternalTime;
  // Other state variables that are not shared
  const [showSettings, setShowSettings] = useState(false);
  
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
  
  // Start blinking effect when countdown completes
  const startBlinking = useCallback(() => {
    if (debug) {
      console.log('Starting timer blink effect');
      console.log(`Timeout blink duration: ${timeoutBlinkDuration} seconds`);
    }
    
    // Use CSS class for blinking instead of JavaScript intervals
    setActualBlinkClass('timer-blink');
    if (debug) {
      console.log('Set blinkClass to: timer-blink');
    }
    
    // Stop blinking after the configured duration (in seconds, converted to ms)
    setTimeout(() => {
      if (debug) {
        console.log(`Stopping timer blink effect after ${timeoutBlinkDuration} seconds`);
      }
      setActualBlinkClass('');
      if (debug) {
        console.log('Set blinkClass to: (empty)');
      }
      setIsComplete(false);
    }, timeoutBlinkDuration * 1000);
  }, [setIsComplete, setActualBlinkClass, timeoutBlinkDuration, debug]);

  // Get className for timer panel, adding blink class when needed
  const getTimerPanelClassName = () => {
    const baseClasses = "timer-content flex items-center space-x-2 text-white bg-black bg-opacity-50 p-2 rounded";
    if (actualBlinkClass) {
      const finalClassName = `${baseClasses} ${actualBlinkClass}`;
      if (debug) {
        console.log('Timer panel className with blink:', finalClassName);
      }
      return finalClassName;
    }
    if (debug) {
      console.log('Timer panel className without blink:', baseClasses);
    }
    return baseClasses;
  };

  // Timer tick function
  const tick = useCallback(() => {
    if (type === 'countdown') {
      setTime(prevTime => {
        // Calculate total seconds
        let totalSeconds = prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds;
        
        // Decrement by 1 second
        totalSeconds -= 1;
        
        // Check if countdown is complete
        if (totalSeconds <= 0) {
          // Schedule state updates for next tick to avoid setState during render
          setTimeout(() => {
            // Stop the timer
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsActive(false);
            setIsComplete(true);
            
            // Call the onComplete callback if provided
            if (onComplete) {
              onComplete();
            }
            
            // Start blinking
            startBlinking();
          }, 0);
          
          // Return zeros for time
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        // Calculate new hours, minutes, seconds
        const newHours = Math.floor(totalSeconds / 3600);
        const newMinutes = Math.floor((totalSeconds % 3600) / 60);
        const newSeconds = totalSeconds % 60;
        
        return {
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds
        };
      });
    } else {
      // Chronometer - count up
      setTime(prevTime => {
        // Calculate total seconds
        let totalSeconds = prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds;
        
        // Increment by 1 second
        totalSeconds += 1;
        
        // Calculate new hours, minutes, seconds
        const newHours = Math.floor(totalSeconds / 3600);
        const newMinutes = Math.floor((totalSeconds % 3600) / 60);
        const newSeconds = totalSeconds % 60;
        
        return {
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds
        };
      });
    }
  }, [type, onComplete, setTime, setIsActive, setIsComplete, startBlinking]);
  
  // Start/pause timer
  const toggleTimer = () => {
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
      
      // Only create interval if this is the icon component (which controls the timer)
      // The below component should only display, not manage intervals
      if (position === 'icon' || !hasExternalState) {
        // Only start interval if we don't already have one running
        if (!intervalRef.current) {
          intervalRef.current = setInterval(tick, 1000);
        }
      }
    } else {
      // Pausing timer
      // Only clear interval if this component manages it
      if (position === 'icon' || !hasExternalState) {
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
    // Only clear interval if this component manages it
    if (position === 'icon' || !hasExternalState) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Clear blinking effect
    setActualBlinkClass('');
    
    setIsActive(false);
    setIsPaused(false);
    setIsComplete(false);
    setActualBlinkClass('');
    
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
    setShowSettings(!showSettings);
  };
  
  // Apply settings and start timer
  const applyAndStartTimer = () => {
    if (type === 'countdown') {
      setTime(configTime);
    } else {
      // For chronometer, start from 00:00:00
      const startTime = { hours: 0, minutes: 0, seconds: 0 };
      setTime(startTime);
    }
    
    setShowSettings(false);
    
    // Start the timer after applying settings
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      setIsComplete(false);
      setActualBlinkClass('');
      
      // Only create interval if this is the icon component (which controls the timer)
      if (position === 'icon' || !hasExternalState) {
        intervalRef.current = setInterval(tick, 1000);
      }
    }
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
  };
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Clear interval when timer is paused (from any component)
  useEffect(() => {
    // Only clear interval if this component is responsible for managing it
    if (isPaused && intervalRef.current && (position === 'icon' || !hasExternalState)) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPaused, position, hasExternalState]);

  // Create interval when timer becomes active (for interval-managing components)
  useEffect(() => {
    // Only create interval if this component is responsible for managing it and timer is active
    if (isActive && !intervalRef.current && (position === 'icon' || !hasExternalState)) {
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [isActive, position, hasExternalState, tick]);
  
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
    if (!isActive && !isPaused) {
      setTime({
        hours: initialHours,
        minutes: initialMinutes,
        seconds: initialSeconds
      });
      setConfigTime({
        hours: initialHours,
        minutes: initialMinutes,
        seconds: initialSeconds
      });
    }
  }, [initialHours, initialMinutes, initialSeconds, isActive, isPaused, setTime]);
  
  // Format time display
  const formatTime = (hours, minutes, seconds) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Only return null if the timer is completely inactive and disabled
  // This ensures the timer continues to be displayed when active, even if disabled in settings
  if (!enabled && !isActive && !isPaused && !isComplete && !showSettings) {
    return null;
  }
  
  // Render icon button only - always show the icon when showIconButton is true and position is icon
  if (showIconButton && position === 'icon' && !showSettings) {
    return (
      <div className="absolute right-[-24px] top-0">
        <button
          onClick={toggleSettings}
          className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
          title={t.timer || 'Timer'}
        >
          <ClockIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  // For icon position, show settings panel if settings are open
  if (position === 'icon' && showIconButton) {
    return (
      <div>
        <div className="absolute right-[-24px] top-0">
          <button
            onClick={toggleSettings}
            className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
            title={t.timer || 'Timer'}
          >
            <ClockIcon className="h-4 w-4 text-white" />
          </button>
        </div>
        
        {/* Settings Panel for icon position */}
        {showSettings && (
          <div 
            ref={settingsRef}
            className="settings-panel absolute z-20 bg-black/80 rounded-lg p-2 shadow-lg w-80"
            style={{ top: '100%', marginTop: '4px', right: '-24px' }}
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
                    className="w-8 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                  />
                  <span className="text-xs">M:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={configTime.minutes}
                    onChange={(e) => handleInputChange('minutes', e.target.value)}
                    className="w-8 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                  />
                  <span className="text-xs">S:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={configTime.seconds}
                    onChange={(e) => handleInputChange('seconds', e.target.value)}
                    className="w-8 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
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
                  className="w-8 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                />
                <span className="text-xs">M:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={configTime.minutes}
                  onChange={(e) => handleInputChange('minutes', e.target.value)}
                  className="w-8 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
                />
                <span className="text-xs">S:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={configTime.seconds}
                  onChange={(e) => handleInputChange('seconds', e.target.value)}
                  className="w-8 bg-gray-700 rounded px-1 py-0.5 text-white text-xs text-center"
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
              onClick={toggleTimer}
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
  debug: PropTypes.bool,
  // Shared timer state props
  isActive: PropTypes.bool,
  isPaused: PropTypes.bool,
  isComplete: PropTypes.bool,
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
    setTime: PropTypes.func,
    setBlinkClass: PropTypes.func
  })
};

export default TimerDisplay;
