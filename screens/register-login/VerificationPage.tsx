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

export default function VerificationPage({ route, navigation }: { route: any; navigation: any }) {
  const { email } = route.params;
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 4) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
  
      const verificationCode = code.join("");
      console.log("Sending verification code to server:", verificationCode);
  
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: verificationCode }),
        }
      );
  
      if (response.ok) {
        Alert.alert("Success", "Verification successful!");
        navigation.navigate("ResetPasswordPage", { email });
      } else {
        const errorResponse = await response.json();
        console.error("Error response from server:", errorResponse);
        Alert.alert("Error", errorResponse.error || "Invalid verification code");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-indigo-700 items-center justify-center px-6"
    >
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
      </View>
    </KeyboardAvoidingView>
  );
}
