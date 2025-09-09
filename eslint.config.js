const nextPlugin = require('@next/eslint-plugin-next');

module.exports = [
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Add any custom rules here
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
  {
    ignores: [
      '**/node_modules',
      '**/.next',
      '**/out',
      '**/build',
      '**/dist',
      '**/public',
    ],
  },
];
