import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ForgotPasswordPage from "../screens/register-login/forgot-password-page";
import { Alert } from "react-native";

// שמירת הפונקציה המקורית של console.error
const originalConsoleError = console.error;

// השתקת התראה לגבי עדכוני Animated(View) שלא עטופים ב-act
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "An update to Animated(View) inside a test was not wrapped in act"
      )
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // הגדרת fetch בצורה נכונה לפני כל טסט
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  it("should render correctly (snapshot)", () => {
    const tree = render(<ForgotPasswordPage navigation={mockNavigation} />);
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("should show an error if email is empty", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByText } = render(
      <ForgotPasswordPage navigation={mockNavigation} />
    );

    fireEvent.press(getByText("Send Verification Code"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Error",
        "Please enter your email address"
      );
    });
  });

  it("should navigate to CodeVerrify page on success", async () => {
    const { getByText, getByPlaceholderText } = render(
      <ForgotPasswordPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.press(getByText("Send Verification Code"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("CodeVerrify", {
        email: "test@example.com",
      });
    });
  });
});
