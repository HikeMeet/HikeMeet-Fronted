// metro.confgi.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});
config.resolver.assetExts.push("cjs");
module.exports = config;
