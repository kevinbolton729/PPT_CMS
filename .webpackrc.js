const { resolve } = require('path');

module.exports = {
  entry: {
    vendor: [
      'classnames',
      'enquire-js',
      'js-md5',
      'lodash',
      'lodash-decorators',
      'moment',
      'numeral',
      'omit.js',
      'path-to-regexp',
      'rc-drawer-menu',
      'react-quill',
    ],
    index: './src/index.js',
  },
  outputPath: resolve(__dirname, 'dist'),
  publicPath: '/',
  commons: [
    {
      names: ['vendor', 'manifest'],
      children: true,
      async: true,
    },
  ],
  manifest: {
    basePath: '/',
  },
  // externals: {
  //   react: 'window.React',
  //   'react-dom': 'window.ReactDOM',
  // },
  html: {
    template: './src/index.ejs',
  },
  theme: './src/theme.js',
  extraBabelPlugins: [
    'transform-decorators-legacy',
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
    production: {
      extraBabelPlugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]],
    },
  },
  alias: {
    '@': resolve(__dirname, 'src'),
  },
  hash: true,
  ignoreMomentLocale: true,
  disableCSSSourceMap: true,
  disableDynamicImport: false,
};
