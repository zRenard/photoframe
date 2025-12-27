import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Cog6ToothIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

const UIControls = memo(({ 
  onToggleConfig, 
  isFullscreen, 
  onToggleFullscreen, 
  language, 
  translations,
  position = 'top-right'
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
  const validPosition = position && positionClasses[position] ? position : 'top-right';

  const handleConfigClick = useCallback((e) => {
    e.stopPropagation();
    onToggleConfig();
  }, [onToggleConfig]);

  const handleFullscreenClick = useCallback((e) => {
    e.stopPropagation();
    onToggleFullscreen();
  }, [onToggleFullscreen]);

  return (
    <div className={`${positionClasses[validPosition]} z-50 flex space-x-2`}>
      {/* Config Button */}
      <button
        onClick={handleConfigClick}
        className="config-button p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        aria-label={t.settings}
      >
        <Cog6ToothIcon className="w-6 h-6" />
      </button>

      {/* Fullscreen Button */}
      <button
        onClick={handleFullscreenClick}
        className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        aria-label={isFullscreen ? t.exitFullscreen : t.enterFullscreen}
      >
        {isFullscreen ? (
          <ArrowsPointingInIcon className="w-6 h-6" />
        ) : (
          <ArrowsPointingOutIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
});

UIControls.displayName = 'UIControls';

UIControls.propTypes = {
  onToggleConfig: PropTypes.func.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  onToggleFullscreen: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired,
  position: PropTypes.oneOf([
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ])
};

export default UIControls;
