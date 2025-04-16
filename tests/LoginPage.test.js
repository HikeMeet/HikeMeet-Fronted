import React = require("react");
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
