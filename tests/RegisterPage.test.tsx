// tests/RegisterPage.test.tsx

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RegisterPage from '../screens/register-login/register-page';

type RootStackParamList = {
  Register: undefined;
};

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack:  jest.fn(),
} as unknown as NavigationProp<RootStackParamList>;

jest.mock('../contexts/auth-context', () => ({
  useAuth: () => ({
    setUser:      jest.fn(),
    setIsVerified: jest.fn(),
  }),
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { email: 'test@example.com' } })
  ),
  sendEmailVerification:    jest.fn(() => Promise.resolve()),
  initializeAuth:           jest.fn(),
  getReactNativePersistence: jest.fn(() => jest.fn()),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error if fields are not filled', async () => {
    const { getByText } = render(
      <RegisterPage navigation={mockNavigation} />
    );
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(getByText('Please fill in all fields.')).toBeTruthy();
    });
  });

  it('should show error if user is under 18', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <RegisterPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Username'), 'younguser');
    fireEvent.changeText(getByPlaceholderText('First Name'), 'Young');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'User');
    fireEvent.changeText(getByPlaceholderText('Email'), 'young@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'Test1234!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Test1234!');

    // Open date picker
    fireEvent.press(getByPlaceholderText('Select Your Birthdate'));

    // Ensure DateTimePicker is rendered
    await waitFor(() => {
      expect(getByTestId('birthdate-picker')).toBeTruthy();
    });

    // Pick a date under 18 (10 years ago)
    const under18Date = new Date();
    under18Date.setFullYear(under18Date.getFullYear() - 10);

    await act(async () => {
      getByTestId('birthdate-picker').props.onChange(
        { nativeEvent: { timestamp: under18Date.getTime() } },
        under18Date
      );
    });

    // Select gender
    await act(async () => {
      fireEvent(
        getByTestId('gender-picker'),
        'onValueChange',
        'male',
        1
      );
    });

    fireEvent.press(getByText('I accept the Terms & Conditions'));
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(
        getByText('You must be at least 18 years old to register.')
      ).toBeTruthy();
    });
  });
});
