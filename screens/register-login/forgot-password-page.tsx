import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomTextInput from "../../components/custom-text-input";
import BackButton from "../../components/back-button";
import Button from "../../components/Button";

export default function ForgotPasswordPage({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");

  const handleSendVerificationCode = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.0.102:5000/api/user/send-verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        Alert.alert(
          "Success",
          "A verification code has been sent to your email."
        );
        navigation.navigate("VerificationPage", { email });
      } else {
        const { error } = await response.json();
        Alert.alert("Error", error || "An error occurred");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-700"
    >
      <View className="flex-1 justify-center items-center p-4">
        <BackButton onPress={() => navigation.goBack()} />
        <Text className="text-3xl font-bold text-white mb-4">Reset Password</Text>
        <Text className="text-lg text-gray-300 mb-6">
          Enter your email to receive a verification code.
        </Text>

        <CustomTextInput
          iconName="email"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Button title="Send Verification Code" onPress={handleSendVerificationCode} />
      </View>
    </KeyboardAvoidingView>
  );
}
