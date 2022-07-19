module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  overrides: [
    {
      files: ['*.ts', '*.mts', '*.cts', '*.tsx', '*.js'],
      rules: {
        'no-undef': 'off'
      }
    }
  ]
}
