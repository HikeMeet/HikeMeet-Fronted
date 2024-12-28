import { getDefaultConfig } from "expo/metro-config";

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

config.resolver.assetExts.push("cjs");

export default config;
