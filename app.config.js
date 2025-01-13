import 'dotenv/config';

export default {
  expo: {
    name: "expo-react-native-w-tailwind",
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
      EXPO_LOCAL_SERVER: "https://hikemeet-backend.onrender.com",
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    owner: "hikemeet",
  },
};
