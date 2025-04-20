import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import LoginPage from '../screens/register-login/login-page';

type RootStackParamList = {
  Login: { toResetPassword: boolean };
  Home: undefined;
};

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
} as unknown as NavigationProp<RootStackParamList, 'Login'>;

const mockRoute = {
  key:    'Login-Test',
  name:   'Login',
  params: { toResetPassword: false },
} as RouteProp<RootStackParamList, 'Login'>;

jest.mock('../contexts/auth-context', () => ({
  useAuth: () => ({
    setUser:      jest.fn(),
    setIsVerified: jest.fn(),
  }),
}));

// Completely suppress console.error for these tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Optionally restore original console.error after tests:
// afterAll(() => {
//   (console.error as jest.Mock).mockRestore();
// });

describe('LoginPage Integration Test with Firebase', () => {
  it('should login successfully with real credentials', async () => {
    const { getByTestId, getByText } = render(
      <LoginPage navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.changeText(
      getByTestId('email_text_field_in_login'),
      'royinagar1@gmail.com'
    );
    fireEvent.changeText(
      getByTestId('Password_text_field_in_login'),
      '12345678'
    );
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });
});
