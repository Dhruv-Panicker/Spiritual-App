
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for Firebase compatibility
config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'main'],
};

// Handle Firebase module resolution without requiring them at config time
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure Firebase packages are transpiled
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

module.exports = config;
