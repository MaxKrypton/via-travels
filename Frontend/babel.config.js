module.exports = function (api) {
  api.cache(true);
  const expoPreset = (() => {
    try {
      return require.resolve("babel-preset-expo");
    } catch (error) {
      return require.resolve("expo/node_modules/babel-preset-expo");
    }
  })();

  return {
    presets: [expoPreset],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          safe: false,
          allowUndefined: true,
        }
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
