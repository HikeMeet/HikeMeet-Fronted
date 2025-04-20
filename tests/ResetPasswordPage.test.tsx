// tests/ForgotPasswordPage.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationProp } from '@react-navigation/native';
import { Alert } from 'react-native';
import ForgotPasswordPage from '../screens/register-login/forgot-password-page';

type RootStackParamList = {
  ForgotPassword: undefined;
  CodeVerrify: { email: string };
};

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack:  jest.fn(),
} as unknown as NavigationProp<RootStackParamList, 'ForgotPassword'>;

jest.mock('../contexts/auth-context', () => ({
  useAuth: () => ({
    setUser:      jest.fn(),
    setIsVerified: jest.fn(),
  }),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fetch to simulate success responses
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  it('should show an error if email is empty', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByText } = render(
      <ForgotPasswordPage navigation={mockNavigation} />
    );

    fireEvent.press(getByText('Send Verification Code'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Please enter your email address'
      );
    });
    console.log('Alert for empty email triggered successfully.');
  });

  it('should navigate to CodeVerrify page on success', async () => {
    const { getByText, getByPlaceholderText } = render(
      <ForgotPasswordPage navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Send Verification Code'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('CodeVerrify', {
        email: 'test@example.com',
      });
    });
    console.log(
      'Navigation to CodeVerrify triggered with email: test@example.com'
    );
  });
});
