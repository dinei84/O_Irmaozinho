import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { MotionGlobalConfig } from 'framer-motion';

// Desativa as animações do framer-motion nos testes: o <AnimatePresence mode="wait">
// (usado no checkout) só monta o elemento entrante após o exit do anterior, o que
// não acontece em jsdom. Com skipAnimations, a troca de step é imediata.
MotionGlobalConfig.skipAnimations = true;

afterEach(() => {
  cleanup();
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
