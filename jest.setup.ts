import "@testing-library/jest-native/extend-expect";

// Mock React Navigation
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  }),
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require("react");
    React.useEffect(() => {
      const cleanup = callback();
      return () => {
        if (cleanup && typeof cleanup === "function") {
          cleanup();
        }
      };
    }, []);
  },
  useIsFocused: () => true,
  useRoute: () => ({
    params: {},
  }),
}));

// Mock NativeWind
jest.mock("nativewind", () => ({
  styled: (component: any) => component,
  StyledComponent: (component: any) => component,
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock Firebase
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  User: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock expo modules
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: "Images",
    Videos: "Videos",
    All: "All",
  },
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
    })
  ),
}));

jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: "mock-token" })),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///mock/",
  downloadAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

jest.mock("expo-video", () => ({
  Video: "Video",
}));

jest.mock("expo-video-thumbnails", () => ({
  getThumbnailAsync: jest.fn(),
}));

// Mock React Native modules
jest.mock("react-native-modal", () => "Modal");
jest.mock("react-native-modal-datetime-picker", () => ({
  default: "DateTimePickerModal",
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native").View;
  return {
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    Directions: {},
    GestureHandlerRootView: View,
    TapGestureHandler: View,
  };
});

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock vector icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
  FontAwesome: "FontAwesome",
  Feather: "Feather",
  AntDesign: "AntDesign",
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// Mock react-native-vector-icons
jest.mock(
  "react-native-vector-icons/MaterialCommunityIcons",
  () => "MaterialCommunityIcons"
);
jest.mock("react-native-vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-vector-icons/FontAwesome", () => "FontAwesome");
jest.mock("react-native-vector-icons/Feather", () => "Feather");
jest.mock("react-native-vector-icons/AntDesign", () => "AntDesign");

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve("Server is working"),
    status: 200,
  })
) as jest.Mock;

// Mock react-native StyleSheet if not available
const ReactNative = require("react-native");
if (!ReactNative.StyleSheet || !ReactNative.StyleSheet.create) {
  ReactNative.StyleSheet = {
    ...ReactNative.StyleSheet,
    create: (styles: any) => styles,
    flatten: (style: any) => style,
    absoluteFillObject: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    hairlineWidth: 1,
  };
}

// Silence console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      args[0]?.includes?.("Animated") ||
      args[0]?.includes?.("NativeEventEmitter") ||
      args[0]?.includes?.("Possible Unhandled Promise Rejection") ||
      args[0]?.includes?.("has been extracted from react-native core") ||
      args[0]?.includes?.("TurboModuleRegistry")
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args: any[]) => {
    if (
      args[0]?.includes?.("Warning: An update to") ||
      args[0]?.includes?.("act()") ||
      args[0]?.includes?.("TurboModuleRegistry") ||
      args[0]?.includes?.("Invariant Violation")
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Mock auth context
jest.mock("./contexts/auth-context", () =>
  require("./tests/__mocks__/auth-context")
);

// Mock chat context
jest.mock("./contexts/chat-context", () =>
  require("./tests/__mocks__/chat-context")
);

// Mock firebase config
jest.mock("./firebaseconfig", () =>
  require("./tests/__mocks__/firebaseconfig")
);

// Mock MapSearch component
jest.mock(
  "./components/map-search-creaete-trip",
  () => require("./tests/__mocks__/map-search").default
);

// Mock trip-related components
jest.mock(
  "./components/profile-image",
  () => require("./tests/__mocks__/profile-image").default
);

jest.mock(
  "./screens/trips/component/starts-rating",
  () => require("./tests/__mocks__/trip-star-rating").default
);

jest.mock(
  "./screens/trips/component/trip-image-gallery",
  () => require("./tests/__mocks__/trip-images-uploader").default
);

jest.mock(
  "./components/get-direction",
  () => require("./tests/__mocks__/map-direction-button").default
);

jest.mock(
  "./screens/trips/component/share-trip-to-post-modal",
  () => require("./tests/__mocks__/share-trip-modal").default
);

// Report button mock removed - component not used in current codebase

jest.mock(
  "./screens/trips/component/trip-row",
  () => require("./tests/__mocks__/trip-row").default
);

jest.mock("./components/requests/fetch-trips", () =>
  require("./tests/__mocks__/fetch-trips")
);

// Mock expo-constants
jest.mock("expo-constants", () => ({
  appOwnership: "expo", // Mock as Expo Go to avoid Mapbox issues
  default: {
    appOwnership: "expo",
  },
}));

// Mock search-related components
jest.mock(
  "./components/search-input",
  () => require("./tests/__mocks__/search-input").default
);

jest.mock(
  "./screens/search/components/search-filters",
  () => require("./tests/__mocks__/search-filters").default
);

jest.mock(
  "./components/user-row-search",
  () => require("./tests/__mocks__/user-row-search").default
);

jest.mock(
  "./screens/groups/components/group-row",
  () => require("./tests/__mocks__/group-row").default
);

jest.mock(
  "./screens/search/components/see-more-button",
  () => require("./tests/__mocks__/search-footer").default
);

jest.mock(
  "./screens/search/components/empty-results",
  () => require("./tests/__mocks__/empty-results").default
);

jest.mock("./components/trip-filter-modal", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    default: function TripFilterModal() {
      return React.createElement(
        View,
        { testID: "trip-filter-modal" },
        React.createElement(Text, null, "Trip Filter Modal")
      );
    },
  };
});

jest.mock("./components/group-filter-modal", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    default: function GroupFilterModal() {
      return React.createElement(
        View,
        { testID: "group-filter-modal" },
        React.createElement(Text, null, "Group Filter Modal")
      );
    },
  };
});

jest.mock("./screens/search/components/search-api", () =>
  require("./tests/__mocks__/search-api")
);

jest.mock("./screens/search/components/filters", () =>
  require("./tests/__mocks__/search-filters-utils")
);
