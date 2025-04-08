import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginPage from "../screens/register-login/login-page";

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };

jest.mock("../contexts/auth-context", () => ({
  useAuth: () => ({
    setUser: jest.fn(),
    setIsVerified: jest.fn(),
  }),
}));

describe("LoginPage Integration Test with Firebase", () => {
  it("should login successfully with real credentials", async () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(
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

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("Home");
      },
      { timeout: 5000 }
    );
  });
});
