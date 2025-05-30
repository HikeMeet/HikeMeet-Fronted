import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { NavigationProp } from "@react-navigation/native";
import RegisterPage from "../../screens/register-login/register-page";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

type RootStackParamList = {
  Register: undefined;
  Verify: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    birthdate: string | null;
    gender: string;
  };
  Login: undefined;
};

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
} as unknown as NavigationProp<RootStackParamList>;

const mockSetUser = jest.fn();
const mockSetIsVerified = jest.fn();

jest.mock("../../contexts/auth-context", () => ({
  useAuth: () => ({
    setUser: mockSetUser,
    setIsVerified: mockSetIsVerified,
  }),
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

jest.mock("../../firebaseconfig", () => ({
  FIREBASE_AUTH: {},
}));

jest.mock("../../components/password-strength", () => ({
  __esModule: true,
  default: ({ password }: { password: string }) => null,
  evaluatePasswordStrength: jest.fn((password: string, enforce: boolean) => {
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain lowercase letters";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain uppercase letters";
    if (!/(?=.*\d)/.test(password)) return "Password must contain numbers";
    if (!/(?=.*[@$!%*?&])/.test(password))
      return "Password must contain special characters";
    return null;
  }),
}));

jest.mock("../../components/error/error-alert-component", () => {
  return ({ message }: { message: string }) => {
    const { Text } = require("react-native");
    return <Text testID="error-message">{message}</Text>;
  };
});

jest.mock("../../components/custom-text-input", () => {
  return ({ placeholder, value, onChangeText, onPress, ...props }: any) => {
    const { TextInput, TouchableOpacity, Text } = require("react-native");
    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} testID={`input-${placeholder}`}>
          <Text>{value || placeholder}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        testID={`input-${placeholder}`}
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

jest.mock("../../components/gender-dropdown", () => {
  return ({ value, onValueChange }: any) => {
    const { View, Text } = require("react-native");
    return (
      <View testID="gender-picker">
        <Text onPress={() => onValueChange("male")}>Male</Text>
        <Text onPress={() => onValueChange("female")}>Female</Text>
        <Text>Current: {value}</Text>
      </View>
    );
  };
});

jest.mock("../../components/turms-and-conditions", () => {
  return ({ visible, onClose }: any) => {
    const { Modal, View, Text, TouchableOpacity } = require("react-native");
    if (!visible) return null;
    return (
      <Modal testID="terms-popup">
        <View>
          <Text>Terms and Conditions</Text>
          <TouchableOpacity onPress={onClose} testID="close-terms">
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
});

jest.mock("../../components/custom-checkbox", () => {
  return ({ checked, onChange, label }: any) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity onPress={onChange} testID="checkbox-terms">
        <Text>
          {checked ? "☑" : "☐"} {label}
        </Text>
      </TouchableOpacity>
    );
  };
});

jest.mock("@react-native-community/datetimepicker", () => {
  return ({ testID, onChange, value }: any) => {
    const { View, Text, TouchableOpacity } = require("react-native");
    return (
      <View testID={testID}>
        <Text>Date Picker</Text>
        <TouchableOpacity
          onPress={() => onChange({}, new Date("1990-01-01"))}
          testID="date-picker-ok"
        >
          <Text>Select Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const under18Date = new Date();
            under18Date.setFullYear(under18Date.getFullYear() - 10);
            onChange({}, under18Date);
          }}
          testID="date-picker-under-18"
        >
          <Text>Select Under 18 Date</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });
    (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
  });

  const fillRequiredFields = async (getByTestId: any, getByText: any) => {
    fireEvent.changeText(getByTestId("input-Username"), "testuser");
    fireEvent.changeText(getByTestId("input-First Name"), "Test");
    fireEvent.changeText(getByTestId("input-Last Name"), "User");
    fireEvent.changeText(getByTestId("input-Email"), "test@example.com");
    fireEvent.changeText(getByTestId("input-Password"), "Test1234!");
    fireEvent.changeText(getByTestId("input-Confirm Password"), "Test1234!");

    // Select birthdate
    fireEvent.press(getByTestId("input-Select Your Birthdate"));
    await waitFor(() => {
      fireEvent.press(getByTestId("date-picker-ok"));
    });

    // Select gender
    fireEvent.press(getByText("Male"));

    // Accept terms
    fireEvent.press(getByTestId("checkbox-terms"));
  };

  it("should render all input fields correctly", () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    expect(getByTestId("input-Username")).toBeTruthy();
    expect(getByTestId("input-First Name")).toBeTruthy();
    expect(getByTestId("input-Last Name")).toBeTruthy();
    expect(getByTestId("input-Email")).toBeTruthy();
    expect(getByTestId("input-Password")).toBeTruthy();
    expect(getByTestId("input-Confirm Password")).toBeTruthy();
    expect(getByTestId("input-Select Your Birthdate")).toBeTruthy();
    expect(getByTestId("gender-picker")).toBeTruthy();
    expect(getByTestId("checkbox-terms")).toBeTruthy();
    expect(getByText("Create an Account")).toBeTruthy();
    expect(getByText("Join us to get started!")).toBeTruthy();
  });

  it("should show error if required fields are not filled", async () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId("button-Register"));

    await waitFor(() => {
      expect(getByText("Please fill in all fields.")).toBeTruthy();
    });
  });

  it("should show error if user is under 18", async () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByTestId("input-Username"), "younguser");
    fireEvent.changeText(getByTestId("input-First Name"), "Young");
    fireEvent.changeText(getByTestId("input-Last Name"), "User");
    fireEvent.changeText(getByTestId("input-Email"), "young@example.com");
    fireEvent.changeText(getByTestId("input-Password"), "Test1234!");
    fireEvent.changeText(getByTestId("input-Confirm Password"), "Test1234!");

    // Select birthdate for someone under 18
    fireEvent.press(getByTestId("input-Select Your Birthdate"));

    await waitFor(() => {
      expect(getByTestId("birthdate-picker")).toBeTruthy();
    });

    // Select under 18 date
    fireEvent.press(getByTestId("date-picker-under-18"));

    fireEvent.press(getByText("Male"));
    fireEvent.press(getByTestId("checkbox-terms"));
    fireEvent.press(getByTestId("button-Register"));

    await waitFor(() => {
      expect(
        getByText("You must be at least 18 years old to register.")
      ).toBeTruthy();
    });
  });

  it("should show error if no gender is selected", async () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByTestId("input-Username"), "testuser");
    fireEvent.changeText(getByTestId("input-First Name"), "Test");
    fireEvent.changeText(getByTestId("input-Last Name"), "User");
    fireEvent.changeText(getByTestId("input-Email"), "test@example.com");
    fireEvent.changeText(getByTestId("input-Password"), "Test1234!");
    fireEvent.changeText(getByTestId("input-Confirm Password"), "Test1234!");

    fireEvent.press(getByTestId("input-Select Your Birthdate"));
    await waitFor(() => {
      fireEvent.press(getByTestId("date-picker-ok"));
    });

    fireEvent.press(getByTestId("checkbox-terms"));
    fireEvent.press(getByTestId("button-Register"));

    await waitFor(() => {
      expect(getByText("No gender")).toBeTruthy();
    });
  });

  it("should show error if passwords do not match", async () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByTestId("input-Username"), "testuser");
    fireEvent.changeText(getByTestId("input-First Name"), "Test");
    fireEvent.changeText(getByTestId("input-Last Name"), "User");
    fireEvent.changeText(getByTestId("input-Email"), "test@example.com");
    fireEvent.changeText(getByTestId("input-Password"), "Test1234!");
    fireEvent.changeText(
      getByTestId("input-Confirm Password"),
      "DifferentPassword!"
    );

    fireEvent.press(getByTestId("input-Select Your Birthdate"));
    await waitFor(() => {
      fireEvent.press(getByTestId("date-picker-ok"));
    });

    fireEvent.press(getByText("Male"));
    fireEvent.press(getByTestId("checkbox-terms"));
    fireEvent.press(getByTestId("button-Register"));

    await waitFor(() => {
      expect(getByText("Passwords do not match.")).toBeTruthy();
    });
  });

  it("should show error if terms and conditions are not accepted", async () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByTestId("input-Username"), "testuser");
    fireEvent.changeText(getByTestId("input-First Name"), "Test");
    fireEvent.changeText(getByTestId("input-Last Name"), "User");
    fireEvent.changeText(getByTestId("input-Email"), "test@example.com");
    fireEvent.changeText(getByTestId("input-Password"), "Test1234!");
    fireEvent.changeText(getByTestId("input-Confirm Password"), "Test1234!");

    fireEvent.press(getByTestId("input-Select Your Birthdate"));
    await waitFor(() => {
      fireEvent.press(getByTestId("date-picker-ok"));
    });

    fireEvent.press(getByText("Male"));
    fireEvent.press(getByTestId("button-Register"));

    await waitFor(() => {
      expect(
        getByText("You must accept the Terms & Conditions to register.")
      ).toBeTruthy();
    });
  });

  it("should handle successful registration and navigate to verify screen", async () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    await fillRequiredFields(getByTestId, getByText);
    fireEvent.press(getByTestId("button-Register"));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "test@example.com",
        "Test1234!"
      );
      expect(sendEmailVerification).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockSetIsVerified).toHaveBeenCalledWith(false);
      expect(mockNavigate).toHaveBeenCalledWith("Verify", {
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        birthdate: "1990-01-01T00:00:00.000Z",
        gender: "male",
      });
    });
  });

  it("should handle Firebase auth error - email already in use", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: "auth/email-already-in-use",
      message: "Email already in use",
    });

    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    await fillRequiredFields(getByTestId, getByText);
    fireEvent.press(getByTestId("button-Register"));

    await waitFor(() => {
      expect(
        getByText("This email is already registered. Please use another email.")
      ).toBeTruthy();
    });
  });

  it("should handle general Firebase auth error", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
      message: "Network error",
    });

    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    await fillRequiredFields(getByTestId, getByText);
    fireEvent.press(getByTestId("button-Register"));

    await waitFor(() => {
      expect(getByText("Network error")).toBeTruthy();
    });
  });

  it("should show date picker when birthdate field is pressed", async () => {
    const { getByTestId } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId("input-Select Your Birthdate"));

    await waitFor(() => {
      expect(getByTestId("birthdate-picker")).toBeTruthy();
    });
  });

  it("should update gender when gender dropdown is used", () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.press(getByText("Female"));

    expect(getByText("Current: female")).toBeTruthy();
  });

  it("should toggle terms and conditions popup", async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    // Open terms popup
    fireEvent.press(getByText("Terms & Conditions"));

    await waitFor(() => {
      expect(getByTestId("terms-popup")).toBeTruthy();
    });

    // Close terms popup
    fireEvent.press(getByTestId("close-terms"));

    await waitFor(() => {
      expect(queryByTestId("terms-popup")).toBeFalsy();
    });
  });

  it("should navigate to login screen when login link is pressed", () => {
    const { getByText } = render(<RegisterPage navigation={mockNavigation} />);

    fireEvent.press(getByText("Log in here"));

    expect(mockNavigate).toHaveBeenCalledWith("Login");
  });

  it("should navigate back when back button is pressed", () => {
    const { getByTestId } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId("back-button"));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it("should show loading state during registration", async () => {
    // Make the registration take some time
    (createUserWithEmailAndPassword as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ user: { email: "test@example.com" } }),
            100
          )
        )
    );

    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    await fillRequiredFields(getByTestId, getByText);
    fireEvent.press(getByTestId("button-Register"));

    // Check loading state
    expect(getByText("Loading...")).toBeTruthy();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it("should toggle checkbox state when pressed", () => {
    const { getByTestId, getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    // Initially unchecked
    expect(getByText("☐ I accept the Terms & Conditions")).toBeTruthy();

    // Click to check
    fireEvent.press(getByTestId("checkbox-terms"));

    expect(getByText("☑ I accept the Terms & Conditions")).toBeTruthy();

    // Click to uncheck
    fireEvent.press(getByTestId("checkbox-terms"));

    expect(getByText("☐ I accept the Terms & Conditions")).toBeTruthy();
  });
});
