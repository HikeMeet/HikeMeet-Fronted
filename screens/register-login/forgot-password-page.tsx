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
  const [email, setEmail] = useState(""); // State for email input
  const [isLoading, setIsLoading] = useState(false); // State for loading animation

  // Function to send the verification code
  const handleSendVerificationCode = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true); // Start the loading animation
    try {
      const response = await fetch(
        `http://172.20.10.4:5000/api/auth/send-verification-code`,
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
        navigation.navigate("VerificationPage", { email }); // Navigate to the verification page
      } else {
        const { error } = await response.json();
        Alert.alert("Error", error || "An error occurred");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    } finally {
      setIsLoading(false); // Stop the loading animation
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-700"
    >
      <View className="flex-1 justify-center items-center p-4">
        {/* Back Button */}
        <BackButton onPress={() => navigation.goBack()} />

        {/* Title */}
        <Text className="text-3xl font-bold text-white mb-4">Reset Password</Text>
        <Text className="text-lg text-gray-300 mb-6">
          Enter your email to receive a verification code.
        </Text>

        {/* Email Input */}
        <CustomTextInput
          iconName="email"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Button with Loading */}
        <Button
          title="Send Verification Code"
          onPress={handleSendVerificationCode}
          isLoading={isLoading} // Use isLoading prop
          color="bg-blue-600" // Custom button color
          disabled={isLoading} // Disable while loading
        />
      </View>
    </KeyboardAvoidingView>
  );
}
