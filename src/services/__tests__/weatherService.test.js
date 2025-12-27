/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect } = pkg;

describe('weatherService', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('weather service module should be importable', async () => {
    // Simple test that the module can be imported without throwing
    const weatherService = await import('../weatherService');
    expect(weatherService).toBeDefined();
  });
});
