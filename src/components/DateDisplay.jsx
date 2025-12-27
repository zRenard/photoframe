import React, { memo, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CalendarIcon } from '@heroicons/react/24/outline';

const DateDisplay = memo(({ 
  showDate,
  dateDisplay,
  enableCalendar,
  language,
  translations
}) => {
  const [currentDate, setCurrentDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

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

  // Update date every minute
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      
      // Use the custom format if provided, otherwise fall back to default
      let formattedDate;
      
      if (dateDisplay.format) {
        // Convert common format patterns to Intl.DateTimeFormat options
        const formatOptions = getDateFormatOptions(dateDisplay.format);
        formattedDate = now.toLocaleDateString(language, formatOptions);
      } else {
        // Default format
        const options = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        formattedDate = now.toLocaleDateString(language, options);
      }
      
      setCurrentDate(formattedDate);
    };

    // Update immediately
    updateDate();

    // Update every minute
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, [language, dateDisplay.format]);

  // Helper function to convert format string to Intl.DateTimeFormat options
  const getDateFormatOptions = (format) => {
    const formatMap = {
      // Long formats
      'EEEE, MMMM d, yyyy': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      'MMMM d, yyyy': { year: 'numeric', month: 'long', day: 'numeric' },
      'EEEE, MMM d, yyyy': { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' },
      
      // Medium formats
      'MMM d, yyyy': { year: 'numeric', month: 'short', day: 'numeric' },
      'EEEE, d MMMM yyyy': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      'd MMMM yyyy': { year: 'numeric', month: 'long', day: 'numeric' },
      
      // Short formats
      'MM/dd/yyyy': { year: 'numeric', month: '2-digit', day: '2-digit' },
      'dd/MM/yyyy': { year: 'numeric', month: '2-digit', day: '2-digit' },
      'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
      
      // Compact formats
      'MMM d': { month: 'short', day: 'numeric' },
      'MMMM d': { month: 'long', day: 'numeric' },
      'EEEE': { weekday: 'long' },
      'EEE': { weekday: 'short' },
      
      // Custom formats
      'd MMM': { month: 'short', day: 'numeric' },
      'MMM yyyy': { year: 'numeric', month: 'short' },
      'MMMM yyyy': { year: 'numeric', month: 'long' }
    };
    
    return formatMap[format] || { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  };

  if (!showDate) {
    return null;
  }

  return (
    <div className={`date-display ${positionClasses[dateDisplay.position]} z-10 bg-black bg-opacity-50 text-white p-3 rounded-lg transition-all duration-300`}>
      <div className="flex items-center justify-center">
        <div className={`${dateSizes[dateDisplay.size]} font-medium text-center`}>
          {currentDate}
        </div>
        {enableCalendar && (
          <button 
            className="ml-2 text-white hover:text-blue-300 cursor-pointer p-1 rounded-full flex items-center justify-center transition-colors" 
            onClick={() => setShowCalendar(true)}
            aria-label="Open calendar"
            type="button"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Calendar Modal would go here if needed */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>{translations?.[language]?.calendarPlaceholder || translations?.en?.calendarPlaceholder || 'Calendar component would go here'}</p>
            <button 
              onClick={() => setShowCalendar(false)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              type="button"
            >
              {translations?.[language]?.close || translations?.en?.close || 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

DateDisplay.displayName = 'DateDisplay';

DateDisplay.propTypes = {
  showDate: PropTypes.bool.isRequired,
  dateDisplay: PropTypes.shape({
    position: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    format: PropTypes.string
  }).isRequired,
  enableCalendar: PropTypes.bool,
  language: PropTypes.string,
  translations: PropTypes.object
};

export default DateDisplay;
