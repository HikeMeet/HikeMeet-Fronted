import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationProp } from "@react-navigation/native";
import { Alert } from "react-native";
import ForgotPasswordPage from "../screens/register-login/forgot-password-page";

type RootStackParamList = {
  ResetPassword: undefined;
  CodeVerify:    { email: string };
};

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack:  jest.fn(),
} as unknown as NavigationProp<RootStackParamList, "ResetPassword">;

jest.mock("../contexts/auth-context", () => ({
  useAuth: () => ({
    setUser:      jest.fn(),
    setIsVerified: jest.fn(),
  }),
}));

jest.mock("firebase/auth", () => ({
  confirmPasswordReset: jest.fn(() => Promise.resolve()),
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("should show error if email is empty", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByText } = render(
      <ForgotPasswordPage navigation={mockNavigation} />
    );
    fireEvent.press(getByText("Send Reset Link"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Error",
        "Please enter your email address"
      );
    });
  });

  it("should navigate to CodeVerify page on success", async () => {
    const { getByText, getByPlaceholderText } = render(
      <ForgotPasswordPage navigation={mockNavigation} />
    );
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.press(getByText("Send Reset Link"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("CodeVerify", {
        email: "test@example.com",
      });
    });
  });
});
