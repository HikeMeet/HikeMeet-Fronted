import { useState, useEffect } from "react";
import React = require("react");
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import BackButton from "../../components/back-button";
import { OtpInput } from "react-native-otp-entry"; // OTP input component for handling user input
import tw from "tailwind-react-native-classnames"; // Tailwind styling utility

export default function CodeVerificationPage({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { email } = route.params; // Email passed from the previous screen
  const [code, setCode] = useState(""); // State to hold the OTP entered by the user
  const [loading, setLoading] = useState(false); // State to indicate verification process
  const [resendLoading, setResendLoading] = useState(false); // State for resend button loading
  const [timer, setTimer] = useState(60); // Countdown timer for resend button
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevents duplicate OTP submissions

  // Timer countdown effect for the resend button
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval); // Cleanup the interval
    }
  }, [timer]);

  // Function to handle OTP verification
  const handleVerifyCode = async () => {
    if (isSubmitting || code.length !== 5) return; // Prevent duplicate submission and ensure code length is valid

    try {
      setLoading(true);
      setIsSubmitting(true); // Set submitting state to true
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/auth/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }), // Send email and OTP code to the server
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Verification successful!");
        navigation.navigate("ResetPasswordOutside", { email }); // Navigate to reset password page
      } else {
        const errorResponse = await response.json();
        Alert.alert(
          "Error",
          errorResponse.error || "Invalid verification code"
        );
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
      setIsSubmitting(false); // Allow new submissions
    }
  };

  // Function to handle resend OTP logic
  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/auth/send-verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }), // Send email to request a new OTP
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Verification code sent successfully!");
        setCode(""); // Reset the code after resending                      //  I need to ckeck this
        setTimer(60); // Reset the timer to 60 seconds
      } else {
        const errorResponse = await response.json();
        Alert.alert(
          "Error",
          errorResponse.error || "Could not resend verification code"
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while resending the code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Automatically trigger verification when the OTP input is complete
  useEffect(() => {
    if (code.length === 5) {
      const timeout = setTimeout(() => handleVerifyCode(), 500); // Delay to ensure the last digit is captured
      return () => clearTimeout(timeout); // Cleanup the timeout
    }
  }, [code]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Ensure proper UI adjustment on iOS when keyboard is open
      className="flex-1 bg-blue-700 items-center justify-center px-6"
    >
      {/* Back button to navigate to the previous screen */}
      <BackButton onPress={() => navigation.goBack()} />

      <View className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        {/* Title and instructions */}
        <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
          Verify Your Email
        </Text>
        <Text className="text-lg text-gray-600 text-center mb-6">
          Enter the 5-digit code sent to{" "}
          <Text className="font-semibold">{email}</Text>.
        </Text>

        {/* OTP Input Component */}
        <OtpInput
          numberOfDigits={5} // Specifies the number of OTP digits
          onTextChange={(text) => setCode(text)} // Updates the OTP state on change
          focusColor="blue" // Color for focused input
          blurOnFilled={true} // Blur input when OTP is filled
          placeholder="-" // Placeholder for empty inputs
          type="numeric" // Restrict input to numeric values
          theme={{
            containerStyle: tw`flex flex-row justify-between mb-6`, // Container style using Tailwind
            pinCodeContainerStyle: tw`border border-gray-300 rounded-lg w-12 h-12 flex items-center justify-center`, // Each digit's container style
            pinCodeTextStyle: tw`text-xl text-gray-800 text-center`, // Style for the text inside each input
            focusStickStyle: tw`h-1 bg-blue-500`, // Style for the focus indicator
          }}
        />

        {/* Verify Button */}
        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${
            loading ? "bg-gray-400" : "bg-green-600"
          }`}
          onPress={handleVerifyCode}
          disabled={loading || code.length !== 5} // Disable if loading or code is incomplete
        >
          {loading ? (
            <ActivityIndicator color="#fff" /> // Show spinner when loading
          ) : (
            <Text className="text-center text-white text-lg font-bold">
              Verify
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Code Button */}
        <TouchableOpacity
          className={`w-full py-4 mt-4 rounded-lg ${
            timer > 0 ? "bg-gray-400" : "bg-blue-600"
          }`}
          onPress={handleResendCode}
          disabled={timer > 0 || resendLoading} // Disable during countdown or when processing resend request
        >
          {resendLoading ? (
            <ActivityIndicator color="#fff" /> // Show spinner when loading
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
