import React, { useState } from "react";
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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { setUser } = useAuth();
  const { toResetPassword } = route.params || {};

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      await AsyncStorage.setItem("token", token);
      setUser(result.user);
      Alert.alert("Success", "Login successful!");
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
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Landing")}
          className="absolute top-10 left-4 bg-gray-200 p-3 rounded-full flex-row items-center"
        >
          <Icon name="arrow-left" size={20} color="#333" />
          <Text className="ml-2 text-gray-800 font-bold">Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-white mb-4">
          Welcome Back!
        </Text>
        <Text className="text-lg text-gray-300 mb-6">
          Log in to your account
        </Text>

        {/* Email Input with Icon */}
        <View className="flex-row items-center w-full p-4 border border-gray-300 rounded-lg bg-white mb-4">
          <Icon name="email" size={20} color="#aaa" className="mr-2" />
          <TextInput
            className="flex-1 text-gray-800 text-lg"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Password Input with Icon */}
        <View className="flex-row items-center w-full p-4 border border-gray-300 rounded-lg bg-white mb-4">
          <Icon name="lock" size={20} color="#aaa" className="mr-2" />
          <TextInput
            className="flex-1 text-gray-800 text-lg"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-lg flex items-center ${
            loading ? "bg-blue-300" : "bg-blue-500"
          } mb-4 flex-row justify-center`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white text-center text-lg font-bold">
                Login
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          className="flex-row items-center"
        >
          <Icon name="account-plus" size={16} color="#aaa" />
          <Text className="text-sm text-gray-300 ml-2">
            Don't have an account?{" "}
            <Text className="text-blue-300 font-bold">Register here</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          className="flex-row items-center mt-2"
        >
          <Icon name="lock-question" size={16} color="#aaa" />
          <Text className="text-sm text-gray-300 ml-2">
            Forgot your password?{" "}
            <Text className="text-blue-300 font-bold">Reset here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
