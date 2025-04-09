/*
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LandingPage from "../screens/landing/landing-page";

// מדמים את navigation כך שנוכל לוודא שהמעבר קורה
const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };

describe("LandingPage", () => {
  it("should render correctly (snapshot)", () => {
    const { toJSON } = render(<LandingPage navigation={mockNavigation} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("should navigate to Login page when pressing login button", () => {
    const { getByText } = render(<LandingPage navigation={mockNavigation} />);
    const loginButton = getByText("Login");
    fireEvent.press(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith("Login", {
      toResetPassword: false,
    });
  });

  it("should navigate to Register page when pressing register button", () => {
    const { getByText } = render(<LandingPage navigation={mockNavigation} />);
    const registerButton = getByText("Register");
    fireEvent.press(registerButton);
    expect(mockNavigate).toHaveBeenCalledWith("Register");
  });
});


*/
