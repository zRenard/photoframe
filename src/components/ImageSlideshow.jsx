import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

const KEN_BURNS_REFERENCE_DURATION = 60;
const KEN_BURNS_STYLE_PRESETS = {
  gentle: {
    scaleDelta: 0.22,
    panX: -5,
    panY: -3.5
  },
  standard: {
    scaleDelta: 0.35,
    panX: -8,
    panY: -6
  },
  cinematic: {
    scaleDelta: 0.5,
    panX: -12,
    panY: -8
  }
};

const ImageSlideshow = memo(({
  currentImage,
  imageDisplayMode,
  transition,
  isTransitioning,
  kenBurnsEffect = false,
  kenBurnsStyle = 'standard',
  rotationTime = 60
}) => {
  // Memoize image style calculation
  const imageStyle = useMemo(() => {
    const safeRotationTime = Math.max(rotationTime || 0, 1);
    const selectedStyle = KEN_BURNS_STYLE_PRESETS[kenBurnsStyle] || KEN_BURNS_STYLE_PRESETS.standard;

    const baseStyle = {
      width: '100%',
      height: '100vh',
      transition: `all ${transition.duration}ms ease-in-out`,
      animationDuration: kenBurnsEffect ? `${safeRotationTime}s` : undefined,
      '--ken-burns-motion-ratio': kenBurnsEffect ? safeRotationTime / KEN_BURNS_REFERENCE_DURATION : undefined,
      '--ken-burns-scale-delta': kenBurnsEffect ? selectedStyle.scaleDelta : undefined,
      '--ken-burns-pan-x': kenBurnsEffect ? `${selectedStyle.panX}%` : undefined,
      '--ken-burns-pan-y': kenBurnsEffect ? `${selectedStyle.panY}%` : undefined
    };

    switch (imageDisplayMode) {
      case 'original':
        return {
          ...baseStyle,
          objectFit: 'none',
          objectPosition: 'center'
        };
      case 'fit':
        return {
          ...baseStyle,
          objectFit: 'cover'
        };
      case 'adjust':
      default:
        return {
          ...baseStyle,
          objectFit: 'contain'
        };
    }
  }, [imageDisplayMode, transition.duration, kenBurnsEffect, kenBurnsStyle, rotationTime]);

  if (!currentImage) {
    return null;
  }

  return (
    <>
      {/* Current Image */}
      <div
        key={`current-${currentImage.url}`}
        className={`slide transition-${transition.type} ${isTransitioning ? '' : 'active'}`}
        style={{
          transition: `all ${transition.duration}ms ease-in-out`,
          zIndex: isTransitioning ? 1 : 2
        }}
      >
        <img
          src={currentImage.url}
          alt={currentImage.name}
          style={imageStyle}
          className={`w-full h-full ${kenBurnsEffect ? 'ken-burns-image' : ''}`}
          loading="lazy"
          onError={(e) => {
            console.error('Failed to load image:', currentImage.url);
            e.target.style.display = 'none';
          }}
        />
      </div>
    </>
  );
});

ImageSlideshow.displayName = 'ImageSlideshow';

ImageSlideshow.propTypes = {
  currentImage: PropTypes.shape({
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }),
  imageDisplayMode: PropTypes.oneOf(['original', 'adjust', 'fit']).isRequired,
  transition: PropTypes.shape({
    type: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired
  }).isRequired,
  isTransitioning: PropTypes.bool.isRequired,
  kenBurnsEffect: PropTypes.bool,
  kenBurnsStyle: PropTypes.oneOf(['gentle', 'standard', 'cinematic']),
  rotationTime: PropTypes.number
};

export default ImageSlideshow;
