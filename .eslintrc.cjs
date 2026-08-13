/**
 * Configuração do ESLint (formato legado `.eslintrc.cjs`, compatível com o
 * ESLint 8.x instalado neste projeto — o flat config `eslint.config.js` é o
 * padrão do ESLint 9, não do 8). Ativa regras de React + Vite + hooks.
 *
 * Nota: `functions/` (Node CommonJS) tem runtime e estilo próprios e é ignorado
 * aqui — o lint do front não deve aplicar regras de browser/JSX ao backend.
 * `dist/`, `node_modules` e `coverage/` são saída de build, ignorados.
 */
module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
    },
    settings: {
        react: { version: 'detect' }
    },
    plugins: ['react-refresh'],
    ignorePatterns: [
        'dist',
        'node_modules',
        'coverage',
        'functions',
        'garbage'
    ],
    rules: {
        // React 17+ (transform automático do Vite): não exige `import React` no JSX.
        'react/react-in-jsx-scope': 'off',
        // O projeto não usa PropTypes (é JS puro, sem TS nem prop-types).
        'react/prop-types': 'off',
        // Textos em português com apóstrofes/acentos dentro do JSX.
        'react/no-unescaped-entities': 'off',
        // Volumoso e estilístico: import React não usado em vários arquivos, etc.
        // Mantido como aviso para o comando sair verde sem esconder o ruído.
        'no-unused-vars': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        'react-refresh/only-export-components': 'warn'
    }
};
