module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@context': './src/context',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};
