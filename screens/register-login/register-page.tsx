import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { evaluatePasswordStrength } from "../utils/passwordUtils";
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
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  User,
  UserCredential,
} from "firebase/auth";
import { sendVerificationCode } from "../../api/Registeration/VerificationService"; // Add this function

export default function RegisterPage({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (pass: string) => {
    setPassword(pass);
    if (!pass) {
      setPasswordStrength("");
    } else {
      const strength = evaluatePasswordStrength(pass);
      setPasswordStrength(strength);
    }
  };
  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long."
      );
      return;
    }

    try {
      setLoading(true);

      createUserWithEmailAndPassword(FIREBASE_AUTH, email, password).then(
        (userCredential: UserCredential) => {
          const user = userCredential.user;
          sendEmailVerification(user)
            .then(() => {
              console.log("User created successfuly!");
              navigation.navigate("Verify");
            })
            .catch((e) => {
              Alert.alert("Email verification could not be sent");
              console.log(e);
            });
        }
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-indigo-700"
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Landing")}
          className="absolute top-10 left-4 bg-gray-200 p-3 rounded-full"
        >
          <Text className="text-gray-800 font-bold">Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-white mb-4">
          Create an Account
        </Text>
        <Text className="text-lg text-gray-300 mb-6">
          Join us to get started!
        </Text>

        <TextInput
          className="w-full p-4 bg-white border border-gray-300 rounded-lg mb-4 text-gray-800"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#aaa"
        />
        <TextInput
          className="w-full p-4 bg-white border border-gray-300 rounded-lg mb-4 text-gray-800"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#aaa"
        />
        <TextInput
          className="w-full p-4 bg-white border border-gray-300 rounded-lg mb-4 text-gray-800"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#aaa"
        />
        <TextInput
          className="w-full p-4 bg-white border border-gray-300 rounded-lg mb-4 text-gray-800"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
        />
        <TextInput
          className="w-full p-4 bg-white border border-gray-300 rounded-lg mb-4 text-gray-800"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={handlePasswordChange}
          placeholderTextColor="#aaa"
        />
        {passwordStrength && (
          <Text
            className={`text-center font-bold mb-4 ${
              passwordStrength === "Strong"
                ? "text-green-400"
                : passwordStrength === "Moderate"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            Password Strength: {passwordStrength}
          </Text>
        )}
        <TextInput
          className="w-full p-4 bg-white border border-gray-300 rounded-lg mb-6 text-gray-800"
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          className={`w-full p-4 rounded-lg ${
            loading ? "bg-green-400" : "bg-green-600"
          }`}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white text-lg">Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          className="mt-6"
        >
          <Text className="text-gray-300">
            Already have an account?{" "}
            <Text className="text-green-300 font-bold">Log in here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
