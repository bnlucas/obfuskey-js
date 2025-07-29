// .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // This should always be the last config to ensure it disables conflicting rules
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    // project: './tsconfig.json', // Uncomment if you use rules that require type information
  },
  rules: {
    'prettier/prettier': 'error', // Enforces Prettier formatting as an ESLint rule
    'indent': ['error', 2, { "SwitchCase": 1 }],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['off'], // <--- ADD THIS LINE: Explicitly turn off ESLint's quotes rule
    'semi': ['error', 'always'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'no-loss-of-precision': 'error' // Keep this rule as 'error' for now
  },
  env: {
    browser: false,
    node: true,
    es6: true
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    'src/**/*.test.ts',
    'src/**/*.spec.ts',
    'src/__tests__/**/*.ts',
  ],
};
