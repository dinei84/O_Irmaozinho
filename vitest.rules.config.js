import { defineConfig } from 'vitest/config';

/**
 * Config dos testes das Firestore Security Rules.
 *
 * Separado do vitest.config.js porque estes testes rodam em ambiente Node (não jsdom),
 * sem o setup do React, e exigem o emulador do Firestore no ar.
 *
 * Executar:  npm run test:rules  (sobe o emulador automaticamente)
 */
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['firestore.rules.test.js'],
        testTimeout: 20000,
        hookTimeout: 20000
    }
});
