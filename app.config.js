export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
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
      package: "com.wooozai.exporeactnativewtailwind",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Show current location on map.",
        },
      ],
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsVersion: "10.16.2",
          RNMapboxMapsDownloadToken: process.env.MAPBOX_TOKEN,
        },
      ],
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "592acf0b-41b8-40a2-b973-b21fbcbd4e8e",
      },
    },
    owner: "wooozai",
  },
});
