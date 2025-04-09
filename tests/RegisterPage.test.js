/*
import React from "react";
import RegisterPage from "../screens/register-login/register-page";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };

jest.mock("../contexts/auth-context", () => ({
  useAuth: () => ({
    setUser: jest.fn(),
    setIsVerified: jest.fn(),
  }),
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { email: "test@example.com" } })
  ),
  sendEmailVerification: jest.fn(() => Promise.resolve()),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(() => jest.fn()),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly (snapshot)", () => {
    const { toJSON } = render(<RegisterPage navigation={mockNavigation} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("should show error if fields are not filled", async () => {
    const { getByText } = render(<RegisterPage navigation={mockNavigation} />);

    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(getByText("Please fill in all fields.")).toBeTruthy();
    });
  });

  it("should show error if user is under 18", async () => {
    const { getByText, getByPlaceholderText, UNSAFE_getAllByType } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Username"), "younguser");
    fireEvent.changeText(getByPlaceholderText("First Name"), "Young");
    fireEvent.changeText(getByPlaceholderText("Last Name"), "User");
    fireEvent.changeText(getByPlaceholderText("Email"), "young@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "Test1234!");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "Test1234!");

    // מפעילים את DatePicker דרך UNSAFE_getAllByType
    const datePickers = UNSAFE_getAllByType(
      require("@react-native-community/datetimepicker").default
    );
    expect(datePickers.length).toBeGreaterThan(0);

    const picker = datePickers[0];
    const under18Date = new Date();
    under18Date.setFullYear(under18Date.getFullYear() - 10); // רק 10 שנים אחורה

    await act(() => {
      picker.props.onChange({}, under18Date);
    });

    // Gender
    const genderPickers = UNSAFE_getAllByType(
      require("@react-native-picker/picker").Picker
    );
    expect(genderPickers.length).toBeGreaterThan(0);

    await act(() => {
      genderPickers[0].props.onValueChange("male", 1);
    });

    fireEvent.press(getByText("I accept the Terms & Conditions"));
    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(
        getByText("You must be at least 18 years old to register.")
      ).toBeTruthy();
    });
  });
});
/*
  it("should navigate to Verify page after successful sign up", async () => {
    const { getByText, getByPlaceholderText, getByDisplayValue } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Username"), "testuser");
    fireEvent.changeText(getByPlaceholderText("First Name"), "Test");
    fireEvent.changeText(getByPlaceholderText("Last Name"), "User");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "Test1234!");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "Test1234!");

    fireEvent.press(getByPlaceholderText("Select Your Birthdate"));
    await act(async () => {
      fireEvent(getByPlaceholderText("Select Your Birthdate"), "onChange", {
        nativeEvent: { timestamp: new Date(2008, 1, 1).getTime() },
      });
    });

    // Simulate GenderPicker selection directly
    await act(async () => {
      fireEvent(getByDisplayValue("Select Gender"), "onValueChange", "male");
    });

    fireEvent.press(getByText("I accept the Terms & Conditions"));

    await act(async () => {
      fireEvent.press(getByText("Register"));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Verify", {
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        birthdate: expect.any(String),
        gender: "male",
      });
    });
  });

  */
