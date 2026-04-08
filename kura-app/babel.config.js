module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 如果你有裝 NativeWind，它的 plugin 會在這裡，例如 'nativewind/babel'
      
      // 💡 關鍵：Reanimated 的 plugin 必須放在 plugins 陣列的「最後一行」
      'react-native-reanimated/plugin',
    ],
  };
};