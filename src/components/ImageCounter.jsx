import React, { memo } from 'react';
import PropTypes from 'prop-types';

const ImageCounter = memo(({ 
  current, 
  total, 
  language, 
  translations, 
  position = 'bottom-right' 
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
  const validPosition = position && positionClasses[position] ? position : 'bottom-right';
  
  return (
    <div className={`${positionClasses[validPosition]} z-50 bg-black bg-opacity-50 text-white p-3 rounded-lg`}>
      <div className="text-sm">
        {t.photo} {current + 1} / {total}
      </div>
    </div>
  );
});

ImageCounter.displayName = 'ImageCounter';

ImageCounter.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  language: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired,
  position: PropTypes.oneOf([
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ])
};

export default ImageCounter;
