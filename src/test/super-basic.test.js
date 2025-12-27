/**
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';

describe('Super Basic Test', () => {
  it('should pass', () => {
    expect(2 + 2).toBe(4);
  });
});
