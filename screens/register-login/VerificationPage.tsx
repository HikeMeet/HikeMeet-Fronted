import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import BackButton from "../../components/back-button";

export default function VerificationPage({ route, navigation }: { route: any; navigation: any }) {
  const { email } = route.params;
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); // For resend button
  const [timer, setTimer] = useState(60); // Countdown timer for resend button

  const inputs = useRef<Array<TextInput | null>>([]);

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Perform verification when the code is complete
  useEffect(() => {
    if (code.every((digit) => digit.length > 0)) {
      // Wait for 500ms before verifying to ensure the last digit is registered
      const timeout = setTimeout(() => {
        handleVerifyCode();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [code]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;

    if (text && index < 4) {
      // Move to the next input
      inputs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      // If empty, move to the previous input
      inputs.current[index - 1]?.focus();
    }

    setCode(newCode);
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      const verificationCode = code.join("");
      const response = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/user/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (response.ok) {
        Alert.alert("Success", "Verification successful!");
        navigation.navigate("ResetPasswordPage", { email });
      } else {
        const errorResponse = await response.json();
        Alert.alert("Error", errorResponse.error || "Invalid verification code");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      const response = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/user/send-verification-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Alert.alert("Success", "Verification code sent successfully!");
        setTimer(60); // Restart timer
      } else {
        const errorResponse = await response.json();
        Alert.alert("Error", errorResponse.error || "Could not resend verification code");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while resending the code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-700 items-center justify-center px-6"
    >
      {/* כפתור Back */}
      <BackButton onPress={() => navigation.goBack()} />

      <View className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <Text className="text-2xl font-bold text-gray-800 text-center mb-4">Verify Your Email</Text>
        <Text className="text-lg text-gray-600 text-center mb-6">
          Enter the 5-digit code sent to <Text className="font-semibold">{email}</Text>.
        </Text>

        <View className="flex-row justify-between mb-6">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              value={digit}
              onChangeText={(text) => handleChange(text.slice(0, 1), index)}
              keyboardType="number-pad"
              maxLength={1}
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl text-gray-800"
            />
          ))}
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${loading ? "bg-gray-400" : "bg-green-600"}`}
          onPress={handleVerifyCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white text-lg font-bold">Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className={`w-full py-4 mt-4 rounded-lg ${timer > 0 ? "bg-gray-400" : "bg-blue-600"}`}
          onPress={handleResendCode}
          disabled={timer > 0 || resendLoading}
        >
          {resendLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white text-lg font-bold">
              {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
