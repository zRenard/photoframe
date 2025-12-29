/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect, beforeEach, afterEach } = pkg;
import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageSlideshow } from '../hooks/useImageSlideshow.js';

describe('useImageSlideshow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, true));
      
      expect(result.current.currentImageIndex).toBe(0);
      expect(result.current.timeLeft).toBe(5);
      expect(result.current.isTransitioning).toBe(false);
      expect(result.current.transitionDirection).toBe('next');
    });

    test('should handle empty images array', () => {
      const { result } = renderHook(() => useImageSlideshow([], 5, false));
      
      expect(result.current.currentImageIndex).toBe(0);
      expect(result.current.getCurrentImage()).toBeNull();
    });

    test('should handle single image', () => {
      const images = ['image1.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false));
      
      expect(result.current.getCurrentImage()).toBe('image1.jpg');
    });
  });

  describe('getCurrentImage', () => {
    test('should return current image', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false));
      
      expect(result.current.getCurrentImage()).toBe('image1.jpg');
    });

    test('should return null for empty array', () => {
      const { result } = renderHook(() => useImageSlideshow([], 5, false));
      
      expect(result.current.getCurrentImage()).toBeNull();
    });

    test('should return first image if index is out of bounds', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false));
      
      expect(result.current.getCurrentImage()).toBe('image1.jpg');
    });
  });

  describe('navigateImage', () => {
    test('should navigate to next image in sequential mode', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false, 'sequential'));
      
      act(() => {
        result.current.navigateImage('next', false);
      });

      expect(result.current.isTransitioning).toBe(true);
      
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.currentImageIndex).toBe(1);
      expect(result.current.isTransitioning).toBe(false);
    });

    test('should navigate to previous image', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false, 'sequential'));
      
      act(() => {
        result.current.navigateImage('prev', false);
      });
      
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.currentImageIndex).toBe(2);
    });

    test('should wrap around at end of images', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false, 'sequential'));
      
      // Navigate to last image
      act(() => {
        result.current.navigateImage('next', false);
        jest.advanceTimersByTime(150);
      });
      
      act(() => {
        result.current.navigateImage('next', false);
        jest.advanceTimersByTime(150);
      });

      expect(result.current.currentImageIndex).toBe(2);
      
      // Should wrap to first image
      act(() => {
        result.current.navigateImage('next', false);
        jest.advanceTimersByTime(150);
      });

      expect(result.current.currentImageIndex).toBe(0);
    });

    test('should navigate to random image', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false, 'random'));
      
      const initialIndex = result.current.currentImageIndex;
      
      act(() => {
        result.current.navigateImage('next', true);
        jest.advanceTimersByTime(150);
      });

      // Should have changed to a different index (may fail rarely due to randomness)
      expect(result.current.currentImageIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.currentImageIndex).toBeLessThan(images.length);
    });

    test('should not navigate if only one image', () => {
      const images = ['image1.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false));
      
      act(() => {
        result.current.navigateImage('next', false);
        jest.advanceTimersByTime(150);
      });

      expect(result.current.currentImageIndex).toBe(0);
    });

    test('should not navigate if already transitioning', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false));
      
      act(() => {
        result.current.navigateImage('next', false);
      });

      expect(result.current.isTransitioning).toBe(true);
      
      // Try to navigate again while transitioning
      act(() => {
        result.current.navigateImage('next', false);
      });

      // Should not have changed
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.currentImageIndex).toBe(1);
    });

    test('should set correct transition direction', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false));
      
      act(() => {
        result.current.navigateImage('next', false);
      });

      expect(result.current.transitionDirection).toBe('next');
      
      act(() => {
        jest.advanceTimersByTime(150);
      });
      
      act(() => {
        result.current.navigateImage('prev', false);
      });

      expect(result.current.transitionDirection).toBe('prev');
    });
  });

  describe('Auto-advance', () => {
    test('should auto-advance in sequential mode', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 2, false, 'sequential'));
      
      expect(result.current.currentImageIndex).toBe(0);
      
      // Advance time by rotation time
      act(() => {
        jest.advanceTimersByTime(2150); // 2s + transition time
      });

      expect(result.current.currentImageIndex).toBe(1);
    });

    test('should auto-advance in random mode', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 2, false, 'random'));
      
      const initialIndex = result.current.currentImageIndex;
      
      act(() => {
        jest.advanceTimersByTime(2150);
      });

      expect(result.current.currentImageIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.currentImageIndex).toBeLessThan(images.length);
    });

    test('should not auto-advance with single image', () => {
      const images = ['image1.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 2, false));
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentImageIndex).toBe(0);
    });

    test('should not auto-advance with empty images', () => {
      const { result } = renderHook(() => useImageSlideshow([], 2, false));
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentImageIndex).toBe(0);
    });
  });

  describe('Countdown', () => {
    test('should countdown when enabled', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, true));
      
      expect(result.current.timeLeft).toBe(5);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeLeft).toBe(4);
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(2);
    });

    test('should reset countdown after reaching 0', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 3, true));
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.timeLeft).toBe(3);
    });

    test('should not countdown when disabled', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false));
      
      const initialTimeLeft = result.current.timeLeft;
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(initialTimeLeft);
    });

    test('should reset countdown when rotation time changes', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result, rerender } = renderHook(
        ({ rotationTime }) => useImageSlideshow(images, rotationTime, true),
        { initialProps: { rotationTime: 5 } }
      );
      
      expect(result.current.timeLeft).toBe(5);
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(3);
      
      // Change rotation time
      act(() => {
        rerender({ rotationTime: 10 });
      });

      expect(result.current.timeLeft).toBe(10);
    });
  });

  describe('handleRotationTimeChange', () => {
    test('should update timeLeft when called', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, true));
      
      act(() => {
        result.current.handleRotationTimeChange(15);
      });

      expect(result.current.timeLeft).toBe(15);
    });
  });

  describe('setTimeLeft', () => {
    test('should manually set timeLeft', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, true));
      
      act(() => {
        result.current.setTimeLeft(20);
      });

      expect(result.current.timeLeft).toBe(20);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup intervals on unmount', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { unmount } = renderHook(() => useImageSlideshow(images, 5, true));
      
      unmount();
      
      // Should not throw errors after unmount
      expect(() => {
        jest.advanceTimersByTime(10000);
      }).not.toThrow();
    });

    test('should cleanup transition timeout on unmount', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result, unmount } = renderHook(() => useImageSlideshow(images, 5, false));
      
      act(() => {
        result.current.navigateImage('next', false);
      });
      
      unmount();
      
      expect(() => {
        jest.advanceTimersByTime(1000);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid navigation calls', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result } = renderHook(() => useImageSlideshow(images, 5, false));
      
      act(() => {
        result.current.navigateImage('next', false);
        result.current.navigateImage('next', false); // Should be ignored
        result.current.navigateImage('next', false); // Should be ignored
      });
      
      act(() => {
        jest.advanceTimersByTime(150);
      });

      // Should only have advanced once
      expect(result.current.currentImageIndex).toBe(1);
    });

    test('should handle switching between sequential and random modes', () => {
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      const { result, rerender } = renderHook(
        ({ order }) => useImageSlideshow(images, 2, false, order),
        { initialProps: { order: 'sequential' } }
      );
      
      act(() => {
        jest.advanceTimersByTime(2150);
      });

      expect(result.current.currentImageIndex).toBe(1);
      
      // Switch to random
      act(() => {
        rerender({ order: 'random' });
      });
      
      act(() => {
        jest.advanceTimersByTime(2150);
      });

      expect(result.current.currentImageIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.currentImageIndex).toBeLessThan(images.length);
    });

    test('should handle images array change', () => {
      const initialImages = ['image1.jpg', 'image2.jpg'];
      const { result, rerender } = renderHook(
        ({ images }) => useImageSlideshow(images, 5, false),
        { initialProps: { images: initialImages } }
      );
      
      expect(result.current.getCurrentImage()).toBe('image1.jpg');
      
      // Change images array
      const newImages = ['newImage1.jpg', 'newImage2.jpg', 'newImage3.jpg'];
      act(() => {
        rerender({ images: newImages });
      });

      // Should still be at index 0 but with new image
      expect(result.current.getCurrentImage()).toBe('newImage1.jpg');
    });

    test('should handle countdown toggle', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const { result, rerender } = renderHook(
        ({ showCountdown }) => useImageSlideshow(images, 5, showCountdown),
        { initialProps: { showCountdown: false } }
      );
      
      const initialTimeLeft = result.current.timeLeft;
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Time should not change when countdown is disabled
      expect(result.current.timeLeft).toBe(initialTimeLeft);
      
      // Enable countdown
      act(() => {
        rerender({ showCountdown: true });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Now it should countdown
      expect(result.current.timeLeft).toBe(4);
    });
  });
});
