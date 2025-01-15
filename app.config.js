import path from 'path';
import dotenv from 'dotenv';

// Check the environment and set default to 'local'
const env = process.env.NODE_ENV || 'production';

// Validate the environment
const validEnvironments = ['test', 'production', 'development', 'test'];
if (!validEnvironments.includes(env)) {
  throw new Error(`Invalid environment '${env}'. Expected one of: ${validEnvironments.join(', ')}`);
}

// Explicitly load the environment-specific .env file
const envFilePath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envFilePath });

// Log the loaded environment and variables
if (!global.__CONFIG_LOADED__) {
  global.__CONFIG_LOADED__ = true;
  console.log(`Running in '${env}' environment`);
  console.log('Loaded Environment Variables:', {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: process.env.FIREBASE_APP_ID,
    MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    EXPO_LOCAL_SERVER: process.env.EXPO_LOCAL_SERVER,
  });
}

export default {
  expo: {
    name: "hikemeet",
    slug: "hikemeet",
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
      buildType: "apk",
      package: "com.roeina.exporeactnativewtailwind",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-router"],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "eb5549ff-c7f5-4a36-85c7-f4bb458abf52",
      },
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      serverUrl: process.env.EXPO_LOCAL_SERVER || "https://hikemeet-backend.onrender.com",
    },
    owner: "hikemeet",
  },
};
