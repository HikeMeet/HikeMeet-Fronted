import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import PasswordStrength from "../../components/password-strength";
import BackButton from "../../components/back-button";
import CustomTextInput from "../../components/custom-text-input";
import Button from "../../components/Button";

export default function ResetPasswordPagetwo({ route, navigation }: { route: any; navigation: any }) {
  const { email } = route.params; // המייל שהגיע מדף האימות
  const [newPassword, setNewPassword] = useState(""); // סיסמה חדשה
  const [confirmPassword, setConfirmPassword] = useState(""); // אישור סיסמה

  // פונקציה לשינוי סיסמה
  const handlePasswordUpdate = async () => {
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_BASE_IP}/api/user/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // שלח את המייל לשרת
          newPassword, // שלח את הסיסמה החדשה
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        Alert.alert("Success", responseData.message || "Password updated successfully");
        navigation.navigate("Login"); // חזרה לדף הבית לאחר עדכון
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to update password");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while updating the password");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-700"
    >
      <View className="flex-1 justify-center items-center p-5">
        {/* לחצן חזרה */}
        <BackButton onPress={() => navigation.goBack()} />
        
        {/* כותרת */}
        <Text className="text-3xl font-bold text-white mb-4">Update Password</Text>
        <Text className="text-lg text-gray-300 mb-6">
          Enter a new password to update your account.
        </Text>

        {/* סיסמה חדשה */}
        <CustomTextInput
          iconName="lock-reset"
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {/* מד סיסמה */}
        <PasswordStrength password={newPassword} />

        {/* אישור סיסמה */}
        <CustomTextInput
          iconName="lock-check"
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* כפתור שינוי סיסמה */}
        <Button
          title="Update Password"
          onPress={handlePasswordUpdate}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
