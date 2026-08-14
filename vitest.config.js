import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
    // Variáveis de ambiente dummy para que `src/lib/firebase.js` possa ser
    // importado nos testes sem um `.env` real (o app valida e lança se faltar).
    // São valores fictícios (não segredos) — os testes que usam Firestore de fato
    // mockam `../lib/firebase`, e aqui só se evita o throw no import.
    env: {
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
      VITE_FIREBASE_APP_ID: '1:000000000000:web:test',
      VITE_MERCADOPAGO_PUBLIC_KEY: 'test-mp-public-key'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    // firestore.rules.test.js roda em config próprio (precisa do emulador): npm run test:rules
    exclude: ['**/node_modules/**', '**/dist/**', 'firestore.rules.test.js'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
