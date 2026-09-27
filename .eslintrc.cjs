module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs'
  },
  overrides: [
    {
      files: ['apps/workforce-console/src/app/**/*.js'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module'
      }
    },
    {
      files: ['apps/workforce-console/**/*.mjs'],
      parserOptions: {
        sourceType: 'module'
      }
    }
  ]
};
