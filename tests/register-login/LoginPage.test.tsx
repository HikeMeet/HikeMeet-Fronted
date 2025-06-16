import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { NavigationProp } from "@react-navigation/native";
import LoginPage from "../../screens/register-login/login-page";
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Set up environment variables
(global as any).process = {
  ...global.process,
  env: {
    ...global.process?.env,
    EXPO_LOCAL_SERVER: process.env.EXPO_LOCAL_SERVER,
  },
};

type RootStackParamList = {
  Landing: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Verify: { email: string };
  ResetPassword: undefined;
  Home: undefined;
};

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
} as unknown as NavigationProp<RootStackParamList>;

const mockSetUser = jest.fn();
const mockSetIsVerified = jest.fn();
const mockFetchMongoUser = jest.fn();

jest.mock("../../contexts/auth-context", () => ({
  useAuth: () => ({
    setUser: mockSetUser,
    setIsVerified: mockSetIsVerified,
    fetchMongoUser: mockFetchMongoUser,
  }),
}));

jest.mock("../../contexts/notification-context", () => ({
  useNotification: () => ({
    expoPushToken: "expo-token-123",
  }),
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock("../../firebaseconfig", () => ({
  FIREBASE_AUTH: {},
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../../components/requests/user-actions", () => ({
  deleteMongoUser: jest.fn(),
}));

jest.mock("../../components/custom-text-input", () => {
  return ({ placeholder, value, onChangeText, testID, ...props }: any) => {
    const { TextInput } = require("react-native");
    return (
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        testID={testID}
        {...props}
      />
    );
  };
});

jest.mock("../../components/back-button", () => {
  return ({ onPress }: { onPress: () => void }) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity onPress={onPress} testID="back-button">
        <Text>Back</Text>
      </TouchableOpacity>
    );
  };
});

jest.mock("../../components/Button", () => {
  return ({ title, onPress, isLoading }: any) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity
        onPress={onPress}
        testID={`button-${title}`}
        disabled={isLoading}
      >
        <Text>{isLoading ? "Loading..." : title}</Text>
      </TouchableOpacity>
    );
  };
});

// Mock Alert
const mockAlert = jest.spyOn(Alert, "alert");

// Mock global fetch
global.fetch = jest.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  const renderLoginPage = (routeParams = {}) => {
    return render(
      <LoginPage navigation={mockNavigation} route={{ params: routeParams }} />
    );
  };

  it("should render all input fields and buttons correctly", () => {
    const { getByTestId, getByText } = renderLoginPage();

    expect(getByText("Welcome Back!")).toBeTruthy();
    expect(getByText("Log in to your account")).toBeTruthy();
    expect(getByTestId("email_text_field_in_login")).toBeTruthy();
    expect(getByTestId("Password_text_field_in_login")).toBeTruthy();
    expect(getByTestId("button-Login")).toBeTruthy();
    expect(getByText("Register here")).toBeTruthy();
    expect(getByText("Reset here")).toBeTruthy();
  });

  it("should show error alert when fields are empty", async () => {
    const { getByTestId } = renderLoginPage();

    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Error",
        "Please fill in all fields"
      );
    });
  });

  it("should show error alert when only email is provided", async () => {
    const { getByTestId } = renderLoginPage();

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Error",
        "Please fill in all fields"
      );
    });
  });

  it("should show error alert when only password is provided", async () => {
    const { getByTestId } = renderLoginPage();

    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "password123"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Error",
        "Please fill in all fields"
      );
    });
  });

  it("should handle successful login with verified email", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@example.com",
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue("firebase-token-123"),
    };

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    const { getByTestId } = renderLoginPage();

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "password123"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "test@example.com",
        "password123"
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "token",
        "firebase-token-123"
      );
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockSetIsVerified).toHaveBeenCalledWith(true);
      expect(mockFetchMongoUser).toHaveBeenCalledWith("user123", true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/register-token"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer firebase-token-123",
          },
          body: JSON.stringify({ token: "expo-token-123" }),
        })
      );
      expect(mockAlert).toHaveBeenCalledWith("Success", "Login successful!");
    });
  });

  it("should handle login with unverified email", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@example.com",
      emailVerified: false,
      getIdToken: jest.fn().mockResolvedValue("firebase-token-123"),
    };

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    const { getByTestId } = renderLoginPage();

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "password123"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockSetIsVerified).toHaveBeenCalledWith(false);
      expect(mockAlert).toHaveBeenCalledWith(
        "Verify Email",
        "Please verify your email before proceeding.",
        expect.arrayContaining([
          expect.objectContaining({
            text: "OK",
            onPress: expect.any(Function),
          }),
        ])
      );
    });

    // Simulate pressing OK in the alert
    const alertCall = mockAlert.mock.calls.find(
      (call) => call[0] === "Verify Email"
    );
    if (
      alertCall &&
      alertCall[2] &&
      alertCall[2][0] &&
      alertCall[2][0].onPress
    ) {
      alertCall[2][0].onPress();
      expect(mockNavigate).toHaveBeenCalledWith("Verify", {
        email: "test@example.com",
      });
    }
  });

  it("should handle navigation with toResetPassword parameter", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@example.com",
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue("firebase-token-123"),
    };

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    const { getByTestId } = renderLoginPage({ toResetPassword: true });

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "password123"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("ResetPassword");
    });
  });

  it("should handle navigation with toResetPassword false parameter", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@example.com",
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue("firebase-token-123"),
    };

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    const { getByTestId } = renderLoginPage({ toResetPassword: false });

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "password123"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(mockFetchMongoUser).toHaveBeenCalledTimes(2); // Called twice when toResetPassword is false
      expect(mockNavigate).toHaveBeenCalledWith("Home");
    });
  });

  it("should handle Firebase authentication errors", async () => {
    const errorMessage = "Invalid email or password";
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
      message: errorMessage,
    });

    const { getByTestId } = renderLoginPage();

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "wrongpassword"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Login Error", errorMessage);
    });
  });

  it("should handle Firebase authentication errors without message", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error());

    const { getByTestId } = renderLoginPage();

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "password123"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Login Error",
        "Something went wrong"
      );
    });
  });

  it("should show loading state during login", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@example.com",
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue("firebase-token-123"),
    };

    // Make the login take some time
    (signInWithEmailAndPassword as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ user: mockUser }), 100)
        )
    );

    const { getByTestId, getByText } = renderLoginPage();

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "password123"
    );
    fireEvent.press(getByTestId("button-Login"));

    // Check loading state
    expect(getByText("Loading...")).toBeTruthy();

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Success", "Login successful!");
    });
  });

  it("should navigate to Register page when register link is pressed", () => {
    const { getByText } = renderLoginPage();

    fireEvent.press(getByText("Register here"));

    expect(mockNavigate).toHaveBeenCalledWith("Register");
  });

  it("should navigate to ForgotPassword page when forgot password link is pressed", () => {
    const { getByText } = renderLoginPage();

    fireEvent.press(getByText("Reset here"));

    expect(mockNavigate).toHaveBeenCalledWith("ForgotPassword");
  });

  it("should navigate to Landing page when back button is pressed", () => {
    const { getByTestId } = renderLoginPage();

    fireEvent.press(getByTestId("back-button"));

    expect(mockNavigate).toHaveBeenCalledWith("Landing");
  });

  it("should handle route params edge case when toResetPassword is undefined", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const mockUser = {
      uid: "user123",
      email: "test@example.com",
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue("firebase-token-123"),
    };

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    const { getByTestId } = renderLoginPage({ toResetPassword: undefined });

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "test@example.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "password123"
    );
    fireEvent.press(getByTestId("button-Login"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("toResetPassword is undefined");
    });

    consoleSpy.mockRestore();
  });

  it("should update input values correctly", () => {
    const { getByTestId } = renderLoginPage();

    fireEvent.changeText(
      getByTestId("email_text_field_in_login"),
      "newemail@test.com"
    );
    fireEvent.changeText(
      getByTestId("Password_text_field_in_login"),
      "newpassword"
    );

    expect(getByTestId("email_text_field_in_login").props.value).toBe(
      "newemail@test.com"
    );
    expect(getByTestId("Password_text_field_in_login").props.value).toBe(
      "newpassword"
    );
  });
});
