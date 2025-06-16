module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@react-navigation|@react-native-async-storage|firebase|@firebase|react-native-reanimated|react-native-gesture-handler|react-native-modal|react-native-modal-datetime-picker|nativewind|react-native-svg|react-native-vector-icons|lucide-react-native|expo-.*|@rnmapbox)",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/tests/__mocks__/fileMock.js",
  },
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.expo/",
    "/babel.config.test.js",
    "/babel.config.js",
  ],
  collectCoverageFrom: ["screens/**/*.{ts,tsx}", "!screens/**/*.d.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  globals: {
    __DEV__: true,
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        configFile: "./babel.config.test.js",
      },
    ],
  },
};
