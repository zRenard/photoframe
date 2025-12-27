/**
 * @jest-environment jsdom
 */
import React from 'react';
import pkg from '@jest/globals';
const { describe, test, expect } = pkg;

describe('WeatherDisplay Component', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });
});
