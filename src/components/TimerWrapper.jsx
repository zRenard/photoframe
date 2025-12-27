import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

const TimerWrapper = memo(({ 
  showTime,
  timeDisplay,
  timeFormat24h,
  showSeconds
}) => {

  // Memoize position classes
  const positionClasses = useMemo(() => ({
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'center-left': 'top-1/2 left-4 transform -translate-y-1/2',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'center-right': 'top-1/2 right-4 transform -translate-y-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  }), []);

  // Memoize time sizes
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

  // Format time based on settings - recalculate every second
  const formattedTime = useMemo(() => {
    const now = new Date();
    const options = {
      hour12: !timeFormat24h,
      hour: '2-digit',
      minute: '2-digit'
    };
    
    if (showSeconds) {
      options.second = '2-digit';
    }
    
    return now.toLocaleTimeString([], options);
  }, [timeFormat24h, showSeconds]); // Remove currentTime dependency

  if (!showTime) {
    return null;
  }

  return (
    <div className={`time-display ${positionClasses[timeDisplay.position]} fixed bg-black bg-opacity-50 text-white p-4 rounded-lg transition-all duration-300`}>
      <div className={`${timeSizes[timeDisplay.size]} font-bold text-center relative`}>
        {formattedTime}
      </div>
    </div>
  );
});

TimerWrapper.displayName = 'TimerWrapper';

TimerWrapper.propTypes = {
  showTime: PropTypes.bool.isRequired,
  timeDisplay: PropTypes.shape({
    position: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired
  }).isRequired,
  timeFormat24h: PropTypes.bool.isRequired,
  showSeconds: PropTypes.bool.isRequired
};

export default TimerWrapper;
