import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationProp } from "@react-navigation/native";
import LandingPage from "../screens/landing/landing-page";

type RootStackParamList = {
  Login:    { toResetPassword: boolean };
  Register: undefined;
};

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack:  jest.fn(),
} as unknown as NavigationProp<RootStackParamList>;

describe("LandingPage", () => {
  it("should navigate to Login page when pressing login button", () => {
    const { getByText } = render(
      <LandingPage navigation={mockNavigation} />
    );
    fireEvent.press(getByText("Login"));
    expect(mockNavigate).toHaveBeenCalledWith("Login", {
      toResetPassword: false,
    });
  });

  it("should navigate to Register page when pressing register button", () => {
    const { getByText } = render(
      <LandingPage navigation={mockNavigation} />
    );
    fireEvent.press(getByText("Register"));
    expect(mockNavigate).toHaveBeenCalledWith("Register");
  });
});
