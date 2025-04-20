import { useState } from "react";
import React from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../../contexts/auth-context";
import CustomTextInput from "../../components/custom-text-input";
import BackButton from "../../components/back-button";
import Button from "../../components/Button";
import { useNotification } from "../../contexts/notification-context";

export default function LoginPage({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { setUser, setIsVerified } = useAuth();
  const { toResetPassword } = route.params || {};

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { expoPushToken } = useNotification();

  const auth = FIREBASE_AUTH;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // 1) get and store Firebase ID token
      const token = await result.user.getIdToken();
      await AsyncStorage.setItem("token", token);
      setUser(result.user);
      if (!result.user.emailVerified) {
        setIsVerified(false);
        Alert.alert(
          "Verify Email",
          "Please verify your email before proceeding.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Verify", { email }),
            },
          ]
        );
      } else {
        setIsVerified(true);

        // 2) register push token with your backend
        if (expoPushToken) {
          await fetch(
            `${process.env.EXPO_LOCAL_SERVER}/api/user/register-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // the same ID token you just saved
              },
              body: JSON.stringify({ token: expoPushToken }),
            }
          );
        }
        Alert.alert("Success", "Login successful!");
        if (toResetPassword !== undefined) {
          navigation.navigate(toResetPassword ? "ResetPassword" : "Home");
        } else {
          // Handle the case when toResetPassword is undefined
          console.warn("toResetPassword is undefined");
        }
      }
    } catch (error: any) {
      Alert.alert("Login Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-900"
    >
      <View className="flex-1 justify-center items-center p-5">
        <BackButton onPress={() => navigation.navigate("Landing")} />

        <Text className="text-3xl font-bold text-white mb-4">
          Welcome Back!
        </Text>
        <Text className="text-lg text-gray-300 mb-6">
          Log in to your account
        </Text>

        <CustomTextInput
          iconName="email"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          testID="email_text_field_in_login"
        />

        <CustomTextInput
          iconName="lock"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          testID="Password_text_field_in_login"
        />

        <Button title="Login" onPress={handleLogin} isLoading={loading} />

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          className="flex-row items-center mt-4"
        >
          <Text className="text-sm text-gray-300">
            Don't have an account?{" "}
            <Text className="text-blue-300 font-bold">Register here</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          className="flex-row items-center mt-2"
        >
          <Text className="text-sm text-gray-300">
            Forgot your password?{" "}
            <Text className="text-blue-300 font-bold">Reset here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
