import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebaseconfig";

export default function ResetPasswordPage({ navigation }: { navigation: any }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      console.log(":::::::", currentUser);
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
          navigation.navigate("Home"); // Navigate to the desired screen after update
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
        <Text className="text-3xl font-bold text-white mb-4">
          Update Password
        </Text>
        <Text className="text-lg text-gray-300 mb-6">
          Enter your current password and a new password to update
        </Text>

        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 text-lg mb-4"
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholderTextColor="#aaa"
        />
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 text-lg mb-4"
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor="#aaa"
        />
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 text-lg mb-4"
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          className="w-full py-4 rounded-lg bg-blue-500 mb-4"
          onPress={handlePasswordUpdate}
        >
          <Text className="text-white text-center text-lg font-bold">
            Update Password
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Text className="text-sm text-gray-300">
            Changed your mind?{" "}
            <Text className="text-blue-300 font-bold">Go back to Profile</Text>
          </Text>
        </TouchableOpacity> */}
      </View>
    </KeyboardAvoidingView>
  );
}
