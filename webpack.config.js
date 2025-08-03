
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add Firebase module resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    '@firebase/util': require.resolve('@firebase/util'),
    '@firebase/logger': require.resolve('@firebase/logger'),
    '@firebase/component': require.resolve('@firebase/component'),
    '@firebase/app-types': require.resolve('@firebase/app-types'),
  };

  return config;
};
