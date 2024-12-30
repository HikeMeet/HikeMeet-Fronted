import React, { useEffect, useState } from "react";
import { onAuthStateChanged, sendEmailVerification, User } from "firebase/auth";
import { View, Text, TouchableOpacity } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";

export default function VerifyEmailPage({ navigation }: { navigation: any }) {
  const [message, setMessage] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      console.log(":::::::", currentUser);
      setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && isButtonDisabled) {
      setIsButtonDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isButtonDisabled]);

  const resendVerificationEmail = async () => {
    if (user) {
      try {
        setIsButtonDisabled(true);
        setCountdown(60); // Start countdown from 60 seconds
        await sendEmailVerification(user);
        setMessage("Verification email resent. Please check your inbox.");
      } catch (error: any) {
        setMessage(`Error: ${error.message}`);
      } finally {
        // Re-enable the button after 60 seconds
        setTimeout(() => setIsButtonDisabled(false), 60000);
      }
    }
  };

  const checkVerificationStatus = async () => {
    if (user) {
      try {
        await user.reload();
        if (user.emailVerified) {
          // Redirect to home page
          navigation.navigate("Home");
        } else {
          setMessage("Email not verified yet. Please check your inbox.");
        }
      } catch (error: any) {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl font-bold mb-4">Verify Your Email Address</Text>
      {message ? (
        <Text className="text-base text-red-500 mb-4 text-center">
          {message}
        </Text>
      ) : null}
      <TouchableOpacity
        className={`p-3 rounded mb-2 w-full ${
          isButtonDisabled ? "bg-gray-400" : "bg-blue-500"
        }`}
        onPress={resendVerificationEmail}
        disabled={isButtonDisabled}
      >
        <Text className="text-white text-center text-base">
          {isButtonDisabled
            ? `Allow to resend in ${countdown}s`
            : "Resend Verification Email"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-green-500 p-3 rounded w-full"
        onPress={checkVerificationStatus}
      >
        <Text className="text-white text-center text-base">
          I Have Verified My Email
        </Text>
      </TouchableOpacity>
    </View>
  );
}
