module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
  },
  overrides: [
    {
      // Node-only script run by GitHub Actions, never shipped to the browser
      files: ['tools/social-media-feed/**/*.mjs'],
      env: { node: true, browser: false },
      rules: {
        'import/extensions': 'off',
        'no-console': 'off',
      },
    },
  ],
};
