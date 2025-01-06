import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import CustomTextInput from "../../components/CustomTextInput";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";

export default function ForgotPasswordPage({
  navigation,
}: {
  navigation: any;
}) {
  const [email, setEmail] = useState("");

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    sendPasswordResetEmail(FIREBASE_AUTH, email)
      .then(() => {
        Alert.alert(
          "Password Reset",
          "A password reset link has been sent to your email address."
        );
        navigation.navigate("Login", { toResetPassword: true });
      })
      .catch((error) => {
        Alert.alert("Error", error.message || "An error occurred");
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-700"
    >
      <View className="flex-1 justify-center items-center p-5">
        <BackButton onPress={() => navigation.goBack()} />
        <Text className="text-3xl font-bold text-white mb-4">
          Reset Password
        </Text>
        <Text className="text-lg text-gray-300 mb-6">
          Enter your email to receive a password reset link
        </Text>

        <CustomTextInput
          iconName="email"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Button title="Send Reset Link" onPress={handlePasswordReset} />

        <Button
          title="Remembered your password? Log in here"
          onPress={() =>
            navigation.navigate("Login", { toResetPassword: true })
          }
          color="#6c757d"
        />
      </View>
    </KeyboardAvoidingView>
  );
}
