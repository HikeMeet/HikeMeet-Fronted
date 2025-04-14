module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@react-navigation|@react-native-async-storage|firebase|@firebase)",
  ],
  snapshotSerializers: [],
  updateSnapshot: "none", // Pre
};
