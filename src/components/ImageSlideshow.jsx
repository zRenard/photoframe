import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

const ImageSlideshow = memo(({ 
  currentImage, 
  imageDisplayMode, 
  transition, 
  isTransitioning
}) => {
  // Memoize image style calculation
  const imageStyle = useMemo(() => {
    const baseStyle = {
      width: '100%',
      height: '100vh',
      transition: `all ${transition.duration}ms ease-in-out`,
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
  }, [imageDisplayMode, transition.duration]);

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
          className="w-full h-full"
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
  isTransitioning: PropTypes.bool.isRequired
};

export default ImageSlideshow;
