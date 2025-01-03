import React, { useState, useRef, useEffect } from "react";
import {View,Text,TextInput,TouchableOpacity,Alert,KeyboardAvoidingView,Platform,ActivityIndicator,} from "react-native";
import { handleRegisterService } from "../../api/Registeration/handleRegisterService";
import {verifyEmailCode,resendVerificationCode,} from "../../api/Registeration/VerificationService";
import { createFirebaseUser } from "../../api/Registeration/firebaseAuth";

export default function VerificationPage({ route, navigation }: { route: any; navigation: any }) {   //need to fix the navigation move bottom-tab and not to home specific

  const { email, username, firstName, lastName, password } = route.params;
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendAllowed, setIsResendAllowed] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resend functionality
  useEffect(() => {

    let interval: NodeJS.Timeout | null = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setIsResendAllowed(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleResendCode = async () => {
    try {

      setLoading(true);
      const response = await resendVerificationCode(email);
      if (!response.success) {
        throw new Error(response.error || "Failed to resend verification code.");
      }
      Alert.alert("Success", "Verification code has been resent.");
      setTimer(60);
      setIsResendAllowed(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 4) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerification = async () => {
    try {
      setLoading(true);
      const verificationCode = code.join("");
  
      // Verify the code with the server
      const response = await verifyEmailCode({ email, code: verificationCode });
      if (!response.success) {
        throw new Error(response.error || "Invalid verification code.");
      }
  
      // Create the user in Firebase
      const firebaseResponse = await createFirebaseUser(email, password);
      if (!firebaseResponse.success) {
        throw new Error(firebaseResponse.error || "Failed to create Firebase user.");
      }
  
      Alert.alert("Success", "User verified and registered!", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
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
          A verification code has been sent to <Text className="font-semibold">{email}</Text>.
        </Text>

        {/* Segmented Input for Verification Code */}
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
          onPress={handleVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white text-lg font-bold">Verify</Text>
          )}
        </TouchableOpacity>

        {/* Resend Code Section */}
        <Text className="text-center text-gray-500 mt-4">
          Didn't receive the code?{" "}
          <TouchableOpacity
            disabled={!isResendAllowed || loading}
            onPress={handleResendCode}
          >
            <Text
              className={`${
                isResendAllowed ? "text-green-600 font-bold" : "text-gray-400"
              }`}
            >
              Resend Code
            </Text>
          </TouchableOpacity>
        </Text>
        {timer > 0 && <Text className="text-center text-gray-500 mt-2">Resend available in {timer} seconds.</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}
