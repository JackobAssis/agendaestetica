import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
    js.configs.recommended,
    {
        plugins: {
            import: importPlugin
        },
        rules: {
            // Regras básicas
            'no-unused-vars': 'error',
            'no-console': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',

            // Import rules
            'import/no-unresolved': 'error',
            'import/named': 'error',
            'import/default': 'error',
            'import/namespace': 'error',

            // Segurança
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
                sessionStorage: 'readonly'
            }
        }
    }
];