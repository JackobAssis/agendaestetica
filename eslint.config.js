import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
    js.configs.recommended,
    {
        plugins: {
            import: importPlugin
        },
        rules: {
            'no-unused-vars': 'error',
            'no-console': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',

            'import/no-unresolved': 'error',
            'import/named': 'error',
            'import/default': 'error',
            'import/namespace': 'error',

            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error'
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                self: 'readonly',
                caches: 'readonly',
                ServiceWorker: 'readonly',
                Cache: 'readonly',
                CacheStorage: 'readonly',
                navigator: 'readonly'
            }
        }
    }
];
