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

export default function ResetPasswordPage({ navigation, route }: { navigation: any; route: any }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { email } = route.params;

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Your password has been updated successfully.");
        navigation.navigate("Login");
      } else {
        const { error } = await response.json();
        Alert.alert("Error", error || "An error occurred");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-700"
    >
      <View className="flex-1 justify-center items-center p-5">
        <BackButton onPress={() => navigation.goBack()} />
        <Text className="text-3xl font-bold text-white mb-4">Update Password</Text>
        <Text className="text-lg text-gray-300 mb-6">
          Enter your new password below.
        </Text>

        <CustomTextInput
          iconName="lock-reset"
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <CustomTextInput
          iconName="lock-check"
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button title="Update Password" onPress={handlePasswordUpdate} />
      </View>
    </KeyboardAvoidingView>
  );
}
