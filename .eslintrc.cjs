module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:svelte/recommended',
    'plugin:svelte/prettier'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser'
    }
  ],
  globals: {
    BigInt: true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  }
}
