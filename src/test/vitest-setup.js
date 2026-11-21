import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

globalThis.jest = vi;
globalThis.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};
