/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect } = pkg;
import { translations } from '../utils/translations.js';

describe('translations', () => {
  test('should have translations object', () => {
    expect(translations).toBeDefined();
    expect(typeof translations).toBe('object');
  });

  test('should have at least english translations', () => {
    expect(translations.en).toBeDefined();
    expect(typeof translations.en).toBe('object');
  });
});
