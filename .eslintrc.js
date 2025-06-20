module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable problematic rules that might cause issues
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/exhaustive-deps': 'off'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
}; 