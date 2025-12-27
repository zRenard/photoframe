/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect } = pkg;
import { renderHook } from '@testing-library/react';
import { useSettings } from '../hooks/useSettings.js';

describe('useSettings', () => {
  test('should initialize with default settings', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });
});
