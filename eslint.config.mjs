import eslint from '@eslint/js';
import globals from 'globals';
import html from 'eslint-plugin-html';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierRecommendedConfig from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    {
        files: ['**/*.html'],
        plugins: {
            html
        },
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'script'
            },
            globals: {
                ...globals.browser,
            }
        },
        rules: {
            indent: ['error', 4],
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
        },
    },
    {
        files: ['**/*.js', '**/*.mjs', '**/*.ts', '**/*.tsx'],
        extends: [eslint.configs.recommended, prettierRecommendedConfig],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    tabWidth: 4,
                    printWidth: 120,
                    singleQuote: true,
                },
            ],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        extends: [
            ...tseslint.configs.recommended,
            ...tseslint.configs.stylistic,
            importPlugin.flatConfigs.recommended,
            importPlugin.flatConfigs.typescript,
        ],
        rules: {
            'import/order': ['error'],
            '@typescript-eslint/no-unused-vars': ['warn'],
            '@typescript-eslint/no-unused-expressions': ['off'],
            '@typescript-eslint/no-empty-function': ['off'],
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
            },
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
);
