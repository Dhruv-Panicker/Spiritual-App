
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push(
  // Images
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'svg'
);

module.exports = config;
