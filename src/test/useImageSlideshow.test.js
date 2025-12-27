/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect } = pkg;
import { renderHook } from '@testing-library/react';
import { useImageSlideshow } from '../hooks/useImageSlideshow.js';

describe('useImageSlideshow', () => {
  test('should initialize with basic properties', () => {
    const images = ['image1.jpg', 'image2.jpg'];
    const { result } = renderHook(() => useImageSlideshow(images, 5000, true));
    
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });
});
