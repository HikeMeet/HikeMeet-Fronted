import { ExpoConfig } from "@expo/config";


const env = process.env.NODE_ENV || "test";

// Validate the environment
const validEnvironments = ["test", "production", "development"];
if (!validEnvironments.includes(env)) {
  throw new Error(
    `Invalid environment '${env}'. Expected one of: ${validEnvironments.join(", ")}`
  );
}

// Explicitly load the environment-specific .env file
// eslint-disable-next-line no-undef
const envFilePath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envFilePath });
const config: ExpoConfig = {
  name: "expo-react-native-w-tailwind",
  slug: "expo-react-native-w-tailwind",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router"],
};

export default config;
