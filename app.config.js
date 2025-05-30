const APP_ENV = process.env.APP_ENV ?? "stage";

// pick the right package:
const packageName =
  APP_ENV === "prod"
    ? "com.hikemeet.app"
    : "com.wooozai.exporeactnativewtailwind";

const logoImage =
  APP_ENV === "prod" ? "./assets/Logo2.png" : "./assets/Logo1.png";

const appName = APP_ENV === "prod" ? "Hikemeet" : "Hikemeet-stage";

export default ({ config }) => ({
  ...config,
  // EAS Update settings:

  expo: {
    ...config.expo,
    name: appName,
    slug: "hikemeetteam",

    version: "1.0.0",
    orientation: "portrait",
    icon: logoImage,
    userInterfaceStyle: "light",
    splash: {
      image: logoImage,
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    updates: {
      url: "https://u.expo.dev/ad9fccb4-c086-4de8-aef4-8d3a23e5a2b0",
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
    },
    // Ensure only matching appVersion clients receive the update
    runtimeVersion: {
      policy: "appVersion",
    },
    android: {
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: logoImage,
        backgroundColor: "#ffffff",
      },
      package: packageName,
      googleServicesFile:
        process.env.APP_ENV === "prod"
          ? "./google-services.prod.json"
          : "./google-services.dev.json",
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
