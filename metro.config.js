
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for Firebase compatibility
config.resolver = {
  ...config.resolver,
  alias: {
    '@firebase/util': require.resolve('@firebase/util'),
    '@firebase/logger': require.resolve('@firebase/logger'),
    '@firebase/component': require.resolve('@firebase/component'),
    '@firebase/app-types': require.resolve('@firebase/app-types'),
  },
  resolverMainFields: ['react-native', 'browser', 'main'],
};

// Ensure Firebase packages are transpiled
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

module.exports = config;
