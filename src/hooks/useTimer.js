
// ...existing code...
import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (countdownHours, countdownMinutes, countdownSeconds, timerType, timeoutBlinkDuration = 10) => {
  // Timer state
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [timerIsPaused, setTimerIsPaused] = useState(false);
  const [timerIsComplete, setTimerIsComplete] = useState(false);
  const [timerIsHidden, setTimerIsHidden] = useState(false);
  const [timerBlinkClass, setTimerBlinkClass] = useState('');
  const [timerTime, setTimerTime] = useState({
    hours: countdownHours,
    minutes: countdownMinutes,
    seconds: countdownSeconds
  });
  const [timeManuallySet, setTimeManuallySet] = useState(false);
  // Store the original manually set time values
  const [originalManualTime, setOriginalManualTime] = useState(null);
  // Store the last popup values at the hook level so they persist across all components
  const [lastPopupValues, setLastPopupValues] = useState({
    hours: 0,
    minutes: 5,
    seconds: 0
  });
  // Prevent global settings from overwriting manual popup set
  const justSetManually = useRef(false);
  // Flag to indicate we're restoring manual time after completion
  const restoringManualTime = useRef(false);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null); // For handling the timeout blink period
  // Use ref to track completion state without causing useCallback to recreate
  const timerIsCompleteRef = useRef(timerIsComplete);
  
  // Keep ref in sync with state
  useEffect(() => {
    timerIsCompleteRef.current = timerIsComplete;
  }, [timerIsComplete]);

  // Update timer time when countdown settings change
  useEffect(() => {
    // Only update when timer is not active AND not paused AND time hasn't been manually set
    // This ensures countdown values are only applied when timer is completely stopped
    // When timer is active or time has been manually set, we should not override the current countdown

    // If we just set manually, skip this update completely
    if (justSetManually.current) {
      justSetManually.current = false;
      return;
    }

    // If we're restoring manual time, skip this update
    if (restoringManualTime.current) {
      return;
    }

    // CRITICAL: If time has been manually set, never override it with global settings
    // This prevents the useEffect from overriding popup-set values
    if (timeManuallySet) {
      return;
    }

    // Only update timer time if timer is completely stopped and time hasn't been manually set
    if (!timerIsActive && !timerIsPaused) {
      if (timerType === 'countdown') {
        const newTime = {
          hours: countdownHours,
          minutes: countdownMinutes,
          seconds: countdownSeconds
        };
        setTimerTime(newTime);
      } else {
        // For chronometer, start from 00:00:00
        const newTime = {
          hours: 0,
          minutes: 0,
          seconds: 0
        };
        setTimerTime(newTime);
      }
    }
  }, [countdownHours, countdownMinutes, countdownSeconds, timerType, timerIsActive, timerIsPaused, timeManuallySet]);

  // Timer tick function
  const tick = useCallback(() => {
    setTimerTime(prevTime => {
      if (timerType === 'countdown') {
        const totalSeconds = prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds;
        
        if (totalSeconds <= 0) {
          setTimerIsActive(false);
          setTimerIsComplete(true);
          
          // Clear the interval immediately
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Start blinking effect
          setTimerBlinkClass('timer-blink');
          
          // Set timeout to clear blink and complete state
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setTimerIsComplete(false);
            setTimerBlinkClass('');
            setTimerIsHidden(true);
            // Ensure timerTime stays at zero after timeout
            setTimerTime({ hours: 0, minutes: 0, seconds: 0 });
            // Clear the timeout ref
            timeoutRef.current = null;
            // NOTE: We do NOT reset timeManuallySet or originalManualTime here
            // so that the user can restart with the same manual values
          }, timeoutBlinkDuration * 1000);
          
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        const newTotalSeconds = totalSeconds - 1;
        return {
          hours: Math.floor(newTotalSeconds / 3600),
          minutes: Math.floor((newTotalSeconds % 3600) / 60),
          seconds: newTotalSeconds % 60
        };
      } else {
        // Chronometer - count up
        const totalSeconds = prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds + 1;
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60
        };
      }
    });
  }, [timerType, timeoutBlinkDuration]);

  // Start timer
  const startTimer = useCallback(() => {
    // Clear any existing timeout first to prevent interference
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset timer states first - including stopping any ongoing animation
    setTimerIsComplete(false);
    setTimerBlinkClass('');
    setTimerIsHidden(false);

    // For countdown timers, validate timer time
    if (timerType === 'countdown') {
      const totalSeconds = timerTime.hours * 3600 + timerTime.minutes * 60 + timerTime.seconds;
      
      if (totalSeconds <= 0) {
        // If manually set but timer is at zero, restore original manual time
        if (timeManuallySet && originalManualTime) {
          setTimerTime(originalManualTime);
          // Use setTimeout to start after state update
          setTimeout(() => {
            setTimerIsActive(true);
            setTimerIsPaused(false);
            if (!intervalRef.current) {
              intervalRef.current = setInterval(tick, 1000);
            }
          }, 0);
          return;
        } else {
          return;
        }
      }
    }

    // Start the timer immediately - the time should already be set correctly
    setTimerIsActive(true);
    setTimerIsPaused(false);

    if (!intervalRef.current) {
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [timerType, tick, timeManuallySet, timerTime, originalManualTime]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setTimerIsPaused(true);
    setTimerIsActive(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimerIsActive(false);
    setTimerIsPaused(false);
    setTimerIsComplete(false);
    setTimerIsHidden(false);
    setTimerBlinkClass('');
    
    // Reset manual flag so timer uses global settings again
    setTimeManuallySet(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Clear timeout if it exists - this should stop any ongoing animation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (timerType === 'countdown') {
      setTimerTime({
        hours: countdownHours,
        minutes: countdownMinutes,
        seconds: countdownSeconds
      });
    } else {
      setTimerTime({ hours: 0, minutes: 0, seconds: 0 });
    }
  }, [timerType, countdownHours, countdownMinutes, countdownSeconds]);




  // Toggle timer (start/pause)
  const toggleTimer = useCallback(() => {
    if (timerIsActive) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [timerIsActive, pauseTimer, startTimer]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clear interval when timer is paused
  useEffect(() => {
    if (timerIsPaused && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [timerIsPaused]);

  // Create interval when timer becomes active
  useEffect(() => {
    if (timerIsActive && !intervalRef.current) {
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [timerIsActive, tick]);

  // Format timer time for display
  const formatTimerTime = useCallback((time) => {
    const { hours, minutes, seconds } = time;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, []);

  // Custom setTime function that marks time as manually set
  const setTimeManually = useCallback((newTime) => {
    // Set the flag first to prevent any interference from useEffect
    justSetManually.current = true;
    
    // Don't clear timeout in setTimeManually - let it run to completion
    // The timeout will be cleared only when startTimer is called
    // This allows the blinking animation to continue for the full 10 seconds
    // unless the user actually starts a new timer
    
    // Update all the states in the correct order
    setTimerTime(newTime);
    setTimeManuallySet(true);
    setOriginalManualTime(newTime);
    
    // Also update the popup values so they persist for next time
    setLastPopupValues(newTime);
    
    // Clear the hidden state so the timer can be started, but don't clear completion
    // state yet - that should only happen when the timer actually starts
    setTimerIsHidden(false);
    // Don't clear completion state here - let startTimer handle it
    // setTimerIsComplete(false);
    // setTimerBlinkClass('');
  }, []); // Remove all state dependencies to prevent infinite loops

  // Reset manual flag so timer uses global settings again
  const resetManualTimeFlag = useCallback(() => {
    setTimeManuallySet(false);
  }, []);

  // Get last popup values
  const getLastPopupValues = useCallback(() => {
    return lastPopupValues;
  }, [lastPopupValues]);

  // Update last popup values
  const updateLastPopupValues = useCallback((values) => {
    setLastPopupValues(values);
  }, []);

  return {
    // State
    timerIsActive,
    timerIsPaused,
    timerIsComplete,
    timerIsHidden,
    timerTime,
    timerBlinkClass,
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    toggleTimer,
    
    // Utilities
    formatTimerTime,
    
    // State setters for external control
    setTimerIsActive,
    setTimerIsPaused,
    setTimerIsComplete,
    setTimerIsHidden,
    setTimerTime,
    setTimerBlinkClass,
    
    // Manual time control
    setTimeManually,
    resetManualTimeFlag,
    
    // Popup values management
    getLastPopupValues,
    updateLastPopupValues
  };
};
