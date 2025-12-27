import { useState, useEffect, useRef, useCallback } from 'react';

export const useImageSlideshow = (images, rotationTime, showCountdown, slideshowOrder = 'sequential') => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(rotationTime);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('next');
  
  const transitionTimeoutRef = useRef(null);

  // Navigate to next/previous image with memoized function
  const navigateImage = useCallback((direction = 'next', useRandom = false) => {
    if (images.length <= 1 || isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection(direction);
    
    // Clear existing transition timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Update image index after transition starts
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentImageIndex(prevIndex => {
        let nextIndex;
        
        if (useRandom) {
          // Random mode: pick a random index that's different from current
          // Only apply exclusion if there are at least 2 images
          if (images.length > 1) {
            do {
              nextIndex = Math.floor(Math.random() * images.length);
            } while (nextIndex === prevIndex);
          } else {
            nextIndex = 0;
          }
        } else {
          // Sequential mode
          nextIndex = direction === 'next'
            ? (prevIndex + 1) % images.length
            : (prevIndex - 1 + images.length) % images.length;
        }
        
        return nextIndex;
      });
      
      // Reset transition state after image changes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 100);
  }, [images.length, isTransitioning]);

  // Memoized function to handle rotation time change
  const handleRotationTimeChange = useCallback((newRotationTime) => {
    setTimeLeft(newRotationTime);
  }, []);

  // Auto-advance images and countdown
  useEffect(() => {
    if (images.length <= 1) return;

    const slideInterval = setInterval(() => {
      if (!isTransitioning) {
        const useRandom = slideshowOrder === 'random';
        navigateImage('next', useRandom);
      }
    }, rotationTime * 1000);

    let countdownInterval;
    if (showCountdown) {
      countdownInterval = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
            return rotationTime; // Reset to full rotation time when it reaches 0
          }
          return prevTimeLeft - 1; // Decrement by 1 second
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(slideInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [rotationTime, images.length, isTransitioning, showCountdown, slideshowOrder, navigateImage]);

  // Reset countdown when rotation time changes
  useEffect(() => {
    if (showCountdown) {
      setTimeLeft(rotationTime);
    }
  }, [rotationTime, showCountdown]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Get current image with error handling
  const getCurrentImage = useCallback(() => {
    if (images.length === 0) return null;
    return images[currentImageIndex] || images[0];
  }, [images, currentImageIndex]);

  return {
    currentImageIndex,
    timeLeft,
    isTransitioning,
    transitionDirection,
    navigateImage,
    handleRotationTimeChange,
    getCurrentImage,
    setTimeLeft
  };
};
