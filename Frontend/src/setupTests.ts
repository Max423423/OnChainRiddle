// vitest-dom adds custom vitest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Remove the generic global mock of `ethers`. Each test file now provides
// a tailored mock that matches its own requirements. This prevents
// conflicts where one global mock is missing methods expected by a
// specific test suite.

// Mock window.ethereum (kept globally as most tests rely on it)
Object.defineProperty(window, 'ethereum', {
  value: {
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  writable: true,
  configurable: true,
}); 