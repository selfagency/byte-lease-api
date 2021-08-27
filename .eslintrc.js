const { readGitignoreFiles } = require('eslint-gitignore')

module.exports = {
  ignorePatterns: [
    ...readGitignoreFiles({
      cwd: __dirname
    })
  ],
  env: {
    es2021: true,
    node: true
  },
  extends: ['standard', 'plugin:security/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier', 'security'],
  rules: {
    'callback-return': ['error'],
    camelcase: ['warn'],
    'eslint-comments/no-unused-disable': ['off'],
    'handle-callback-err': ['error'],
    indent: ['off'],
    'key-spacing': ['off'],
    'linebreak-style': ['warn', 'unix'],
    'no-console': ['warn'],
    'no-eval': ['error'],
    'no-mixed-requires': ['error'],
    'no-script-url': ['error'],
    'no-undef': ['off'],
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: 'i|res|next|^err'
      }
    ],
    'no-useless-escape': ['off'],
    'node/no-extraneous-import': ['off'],
    'node/no-unpublished-require': ['off'],
    'node/no-unsupported-features/es-syntax': ['off'],
    'padding-line-between-statements': ['warn'],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true
      }
    ],
    'security/detect-non-literal-fs-filename': ['off'],
    'security/detect-non-literal-regexp': ['off'],
    'security/detect-non-literal-require': ['off'],
    'security/detect-object-injection': ['off'],
    semi: ['warn', 'never'],
    'wrap-iife': ['error', 'inside']
  }
}
