module.exports = function (api) {
  api.cache(true);
  const ENV = process.env.APP_ENV || "prod"; // Default to local environment
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel", // Include nativewind
      [
        "module:react-native-dotenv", // Include react-native-dotenv
        {
          moduleName: "@env",
          path: `.env.${ENV}`,
        },
      ],
    ],
  };
};
