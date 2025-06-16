// __tests__/landing-page.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationProp } from "@react-navigation/native";
import LandingPage from "../screens/landing/landing-page";

type RootStackParamList = {
  Login: { toResetPassword: boolean };
  Register: undefined;
};

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
} as unknown as NavigationProp<RootStackParamList>;

describe("LandingPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });
  it("renders all key elements", async () => {
    const { getByTestId } = render(<LandingPage navigation={mockNavigation} />);
    const response: Response = await fetch(
      `${process.env.EXPO_LOCAL_SERVER}/api`
    );
    const data: string = await response.text();

    expect(response.status).toBe(200);
    expect(data).toMatch(/Server is working/i);
    expect(getByTestId("landing_screen")).toBeTruthy();
    expect(getByTestId("landing_logo")).toBeTruthy();
    expect(getByTestId("landing_title")).toHaveTextContent("HikeMeet");
    expect(getByTestId("landing_subtitle")).toBeTruthy();
    expect(getByTestId("login_button")).toBeTruthy();
    expect(getByTestId("login_button_text")).toHaveTextContent("Login");
    expect(getByTestId("register_button")).toBeTruthy();
    expect(getByTestId("register_button_text")).toHaveTextContent("Register");
  });
  it("navigates to Login page when login button is pressed", () => {
    const { getByTestId } = render(<LandingPage navigation={mockNavigation} />);
    fireEvent.press(getByTestId("login_button"));
    expect(mockNavigate).toHaveBeenCalledWith("Login", {
      toResetPassword: false,
    });
  });
  it("navigates to Register page when register button is pressed", () => {
    const { getByTestId } = render(<LandingPage navigation={mockNavigation} />);
    fireEvent.press(getByTestId("register_button"));
    expect(mockNavigate).toHaveBeenCalledWith("Register");
  });
});
