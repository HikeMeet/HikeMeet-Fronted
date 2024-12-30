import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebaseconfig";

export default function ForgotPasswordPage({
  navigation,
}: {
  navigation: any;
}) {
  const [email, setEmail] = useState("");

  const auth = FIREBASE_AUTH;

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    sendPasswordResetEmail(auth, email)
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
        <Text className="text-3xl font-bold text-white mb-4">
          Reset Password
        </Text>
        <Text className="text-lg text-gray-300 mb-6">
          Enter your email to receive a password reset link
        </Text>

        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 text-lg mb-4"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          className="w-full py-4 rounded-lg bg-blue-500 mb-4"
          onPress={handlePasswordReset}
        >
          <Text className="text-white text-center text-lg font-bold">
            Send Reset Link
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text className="text-sm text-gray-300">
            Remembered your password?{" "}
            <Text className="text-blue-300 font-bold">Log in here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
