import { useEffect, useState } from "react";
import React = require("react");
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import PasswordStrength from "../../components/password-strength";
import CustomTextInput from "../../components/custom-text-input";
import Button from "../../components/Button";

export default function ResetPasswordInsidePage({
  navigation,
}: {
  navigation: any;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // Re-authenticate the user
      reauthenticateWithCredential(user, credential)
        .then(() => {
          // Update the password
          return updatePassword(user, newPassword);
        })
        .then(() => {
          Alert.alert("Success", "Password updated successfully");
          navigation.goBack();
        })
        .catch((error) => {
          Alert.alert(
            "Error",
            error.message || "An error occurred during password update"
          );
        });
    } else {
      Alert.alert("Error", "No authenticated user found");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-700"
    >
      <View className="flex-1 justify-center items-center p-5">
        {/* <BackButton onPress={() => navigation.goBack()} /> */}
        <Text className="text-3xl font-bold text-white mb-4">
          Update Password
        </Text>
        <Text className="text-lg text-gray-300 mb-6">
          Enter your current password and a new password to update
        </Text>

        <CustomTextInput
          iconName="lock"
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <CustomTextInput
          iconName="lock-reset"
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <PasswordStrength password={newPassword} />
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
