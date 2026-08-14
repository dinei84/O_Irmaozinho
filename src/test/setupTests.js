import '@testing-library/jest-dom';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { MotionGlobalConfig } from 'framer-motion';

// A suíte roda 21 arquivos de teste em paralelo (threads). Sob contenção de CPU, o
// timeout padrão de 1s do waitFor/findBy* pode estourar antes de um re-render assíncrono
// concluir — causando falhas intermitentes (flaky) em testes que esperam efeito async
// (ex.: CommentsSection "carregar mais"). Subir o teto para 5s (dentro do testTimeout de
// 10s) torna a suíte determinística sob carga sem afetar a velocidade dos testes que
// passam (findBy resolve assim que o elemento aparece).
configure({ asyncUtilTimeout: 5000 });

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
