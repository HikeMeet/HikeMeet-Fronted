module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel", // Include nativewind
      [
        "module:react-native-dotenv", // Include react-native-dotenv
        {
          moduleName: "@env",
          path: ".env",
        },
      ],
    ],
  };
};
