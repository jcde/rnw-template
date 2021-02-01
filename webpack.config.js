const createExpoWebpackConfigAsync = require('@expo/webpack-config');
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      // https://forums.expo.io/t/expo-start-web-failed-to-compile-after-import-native-base/40826/9
      dangerouslyAddModulePathsToTranspile: ['@codler/react-native-keyboard-aware-scroll-view']
    }
  }, argv);
  return config;
};