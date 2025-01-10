import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import PasswordStrength, {
  evaluatePasswordStrength,
} from "../../components/password-strength";
import BackButton from "../../components/back-button";
import CustomTextInput from "../../components/custom-text-input";

export default function ResetPasswordForgotPage({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const titleOpacity = new Animated.Value(0);
  const buttonScale = new Animated.Value(1);

  useEffect(() => {
    // Title animation on load
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleButtonPress = () => {
    // Button press animation sequence
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(handlePasswordUpdate);
  };

  const handlePasswordUpdate = async () => {
    setError(null); // Clear any previous error

    // Input validation
    if (!email || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate password strength
    const enforceStrongPassword = false; // Change to true if you want stricter rules
    const passwordStrengthError = evaluatePasswordStrength(
      newPassword,
      enforceStrongPassword
    );
    if (passwordStrengthError) {
      setError(passwordStrengthError);
      return;
    }

    setIsLoading(true); // Start loading animation
    try {
      const response = await fetch(
        `http://10.100.102.172:3000/api/auth/update-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        Alert.alert(
          "Success",
          responseData.message || "Password updated successfully",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error while sending the update password request:", error);
      setError("An error occurred while updating the password.");
    } finally {
      setIsLoading(false); // Stop loading animation
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-700"
    >
      <View className="flex-1 justify-center items-center p-5">
        {/* Back Button */}
        <BackButton onPress={() => navigation.goBack()} />

        {/* Title with Animation */}
        <Animated.Text
          style={{
            opacity: titleOpacity,
            transform: [
              {
                translateY: titleOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
          className="text-3xl font-bold text-white mb-4"
        >
          Update Password
        </Animated.Text>

        <Text className="text-lg text-gray-300 mb-6">
          Enter a new password to update your account.
        </Text>

        {/* Error Message */}
        {error && (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        )}

        {/* New Password Input */}
        <CustomTextInput
          iconName="lock-reset"
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {/* Password Strength Meter */}
        <PasswordStrength password={newPassword} />

        {/* Confirm Password Input */}
        <CustomTextInput
          iconName="lock-check"
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Update Password Button with Animation */}
        <TouchableOpacity
          onPress={handleButtonPress}
          disabled={isLoading}
          style={{
            transform: [{ scale: buttonScale }],
          }}
          className={`flex-row justify-center items-center p-4 w-full rounded ${
            isLoading ? "bg-gray-500" : "bg-blue-600"
          }`}
        >
          <Text className="text-white font-bold text-base">
            {isLoading ? "Processing..." : "Update Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
