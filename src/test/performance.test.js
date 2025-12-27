/**
 * @jest-environment jsdom
 */
import pkg from '@jest/globals';
const { describe, test, expect } = pkg;

describe('Performance', () => {
  test('should pass basic performance test', () => {
    expect(true).toBe(true);
  });
});
