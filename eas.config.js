export default {
  cli: {
    version: ">= 15.0.14",
    appVersionSource: "remote",
  },
  build: {
    development: {
      developmentClient: true,
      distribution: "internal",
    },
    preview: {
      distribution: "internal",
    },
    production: {
      autoIncrement: true,
      env: {
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
        EXPO_LOCAL_SERVER: process.env.EXPO_LOCAL_SERVER,
        MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
        MAPBOX_TOKEN_PUBLIC: process.env.MAPBOX_TOKEN_PUBLIC,
        GOOGLEMAP_API_KEY: process.env.GOOGLEMAP_API_KEY,
      },
    },
  },
  submit: {
    production: {},
  },
};
