import React, { memo } from 'react';
import PropTypes from 'prop-types';

const NoImagesMessage = memo(({ language, translations }) => {
  const t = translations[language] || translations.en;
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-50 text-white p-4 rounded-lg max-w-md text-center">
      <div className="text-lg font-semibold mb-2">📷 {t.noImages || 'No Images Found'}</div>
      <div className="text-sm text-gray-300">
        {t.noImagesMessage || 'Place your images in the public/photos directory to display them in the slideshow.'}
      </div>
    </div>
  );
});

NoImagesMessage.displayName = 'NoImagesMessage';

NoImagesMessage.propTypes = {
  language: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired
};

export default NoImagesMessage;
