import React = require("react");
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VerifyEmailPage from "../../screens/register-login/email-verification-page";
import LandingPage from "../../screens/landing/landing-page";
import LoginPage from "../../screens/register-login/login-page";
import RegisterPage from "../../screens/register-login/register-page";
import ForgotPasswordPage from "../../screens/register-login/forgot-password-page";
import CodeVerificationPage from "../../screens/register-login/code-verification-page";
import ResetPasswordForgotPage from "../../screens/register-login/reset-password-forgot-page";

const Stack = createNativeStackNavigator();

const SignInLandingStack = () => {
  return (
    <Stack.Navigator initialRouteName="Landing">
      <Stack.Screen
        name="Verify"
        component={VerifyEmailPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Landing"
        component={LandingPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPasswordOutside"
        component={ResetPasswordForgotPage}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CodeVerrify"
        component={CodeVerificationPage}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SignInLandingStack;
