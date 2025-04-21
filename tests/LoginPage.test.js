import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginPage from "../screens/register-login/login-page";

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };
jest.mock("expo-modules-core", () => ({
  EventEmitter: class {
    addListener() {}
    removeAllListeners() {}
  },
  // stub whatever else your code might touch
  NativeModulesProxy: {},
}));
//  Stub out expo-device
jest.mock("expo-device", () => ({
  isDevice: true,
}));
//  Stub out expo‑constants (default export)
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { eas: { projectId: "test-project" } } },
    easConfig: { projectId: "test-project" },
  },
}));

// Stub out expo‑notifications so none of its native logic runs
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "test-token" }),
  addNotificationReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
  removeNotificationSubscription: jest.fn(),
}));

jest.mock("../contexts/notification-context", () => ({
  useNotification: () => ({
    expoPushToken: "test-token",
    notification: null,
    error: null,
  }),
}));

jest.mock("../contexts/auth-context", () => ({
  useAuth: () => ({
    setUser: jest.fn(),
    setIsVerified: jest.fn(),
  }),
}));

// Completely suppress console.error for these tests
beforeAll(() => {
  console.error = () => {};
});

// Optionally, you could restore it after the tests run if needed:
// afterAll(() => {
//   // Restore original console.error if required
// });

describe("LoginPage Integration Test with Firebase", () => {
  it("should login successfully with real credentials", async () => {
    const { getByTestId, getByText } = render(
      <LoginPage
        navigation={mockNavigation}
        route={{ params: { toResetPassword: false } }}
      />
    );

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "royinagar1@gmail.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "12345678"
    );
    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Home");
    });
  });
});
