export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    name: "Hikemeet",
    slug: "hikemeetteam",

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
        projectId: "ad9fccb4-c086-4de8-aef4-8d3a23e5a2b0",
      },
    },
    owner: "hikemeetteam",
  },
});
