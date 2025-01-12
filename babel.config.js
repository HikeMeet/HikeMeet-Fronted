module.exports = function (api) {
  api.cache(true);
  const ENV = process.env.APP_ENV || "local"; // Default to prod
  console.log(`Using environment: ${ENV}`);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: `.env.${ENV}`,
        },
      ],
    ],
  };
};
