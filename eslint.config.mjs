import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**'],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    rules: {
      // --- disabled ---
      'no-console':           'off',
      'comma-dangle':         'off',
      'no-plusplus':          'off',
      'no-case-declarations': 'off',
      'no-restricted-syntax': 'off',
      'no-await-in-loop':     'off',      

      // --- warnings ---
      'no-unused-vars':         'warn',
      'array-callback-return':  'warn',
      'prefer-template':        'warn',
      'prefer-const':           'warn',
      'no-trailing-spaces':     'warn',
      'no-multiple-empty-lines':'warn',
      'indent':                 ['warn', 2],
      'spaced-comment':         'warn',
      'padded-blocks':          'off',
      'no-param-reassign':      'warn',
      'arrow-body-style':       'warn',

      // --- errors ---
      'max-len': ['error', 250, 4, { ignoreUrls: true }],
    },
  },
];
