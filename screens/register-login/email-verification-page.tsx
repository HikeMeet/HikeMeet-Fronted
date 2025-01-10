import React, { useEffect, useState } from "react";
import { View, Text, Image, Alert, ActivityIndicator } from "react-native";
import { onAuthStateChanged, sendEmailVerification, signOut, User } from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import BackButton from "../../components/back-button";
import Button from "../../components/Button";

export default function VerifyEmailPage({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const [message, setMessage] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const { username, email, firstName, lastName } = route.params;

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0 && isButtonDisabled) {
      setIsButtonDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isButtonDisabled]);

  const resendVerificationEmail = async () => {
    if (user) {
      try {
        setIsButtonDisabled(true);
        setCountdown(60);
        await sendEmailVerification(user);
        setMessage("Verification email resent. Please check your inbox.");
      } catch (error: any) {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  const insertUser = async (userId: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `http://172.20.10.4:5000/api/user/insert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            first_name: firstName,
            last_name: lastName,
            firebase_id: userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, error: ${data.error}`
        );
      }

      console.log("data:\n", data.user._id);
      return data.user._id; // Return the _id
    } catch (error) {
      console.error("Error inserting user:", error);
      return null; // Return null in case of error
    }
  };

  const checkVerificationStatus = async () => {
    console.log(user);
    if (user) {
      try {
        await user.reload();
        await signOut(FIREBASE_AUTH);
        if (user.emailVerified) {
            insertUser(user.uid);
            navigation.navigate("Login", {
          });
        } else {
          setMessage("Email not verified yet. Please check your inbox.");
        }
      } catch (error: any) {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <BackButton onPress={() => navigation.goBack()} />

      {/* Header Image */}
      <Image
        source={require("../../assets/email_verification.png")}
        style={{ width: 150, height: 150, marginBottom: 20 }}
      />

      {/* Page Title */}
      <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
        Verify Your Email Address
      </Text>

      {/* Message */}
      {message && (
        <Text className="text-base text-red-500 text-center mb-4">
          {message}
        </Text>
      )}

      {/* Resend Email Button */}
      <Button
        title={
          isButtonDisabled
            ? `Resend in ${countdown}s`
            : "Resend Verification Email"
        }
        onPress={resendVerificationEmail}
        disabled={isButtonDisabled}
        color={isButtonDisabled ? "bg-gray-400" : "bg-blue-500"} // Use consistent color props
      />

      {/* Verification Confirmation Button */}
      <Button
        title="I Have Verified My Email"
        onPress={checkVerificationStatus}
        color="bg-green-600"
      />

      {/* Loading Indicator */}
      {isButtonDisabled && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="small" color="#2196f3" />
        </View>
      )}
    </View>
  );
}
