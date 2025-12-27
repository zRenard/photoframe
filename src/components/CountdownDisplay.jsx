import React, { memo } from 'react';
import PropTypes from 'prop-types';

const CountdownDisplay = memo(({ 
  timeLeft, 
  language, 
  translations, 
  position = 'bottom-left' 
}) => {
  const t = translations[language] || translations.en;

  // Position classes mapping
  const positionClasses = {
    'top-left': 'fixed top-4 left-4',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'fixed top-4 right-4',
    'center-left': 'fixed top-1/2 left-4 transform -translate-y-1/2',
    'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'center-right': 'fixed top-1/2 right-4 transform -translate-y-1/2',
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'fixed bottom-4 right-4'
  };

  // Get valid position
  const validPosition = position && positionClasses[position] ? position : 'bottom-left';
  
  // Format time based on remaining duration
  const formatTime = (seconds) => {
    if (seconds < 60) {
      // Less than 1 minute: show only seconds
      return `${seconds}s`;
    } else if (seconds < 3600) {
      // Between 1 minute and 1 hour: show minutes and seconds
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    } else {
      // More than 1 hour: show hours and minutes
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins.toString().padStart(2, '0')}m`;
    }
  };
  
  return (
    <div className={`${positionClasses[validPosition]} z-50 bg-black bg-opacity-50 text-white p-3 rounded-lg`}>
      <div className="text-sm text-gray-300">{t.nextIn}</div>
      <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
    </div>
  );
});

CountdownDisplay.displayName = 'CountdownDisplay';

CountdownDisplay.propTypes = {
  timeLeft: PropTypes.number.isRequired,
  language: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired,
  position: PropTypes.oneOf([
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ])
};

export default CountdownDisplay;
