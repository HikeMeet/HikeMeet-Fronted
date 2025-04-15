export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    name: "HikeMeet",
    slug: "expo-react-native-w-tailwind",
    extra: {
      GOOGLEMAP_API_KEY: process.env.GOOGLEMAP_API_KEY,
    },

    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/Logo2.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/Logo2.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: "./assets/Logo2.png",
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
      [
        "expo-video",
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
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
