import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../firebaseconfig";
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
  UserCredential,
} from "firebase/auth";
import { sendVerificationCode } from "../../api/Registeration/VerificationService";
import PasswordStrength, { evaluatePasswordStrength } from "../../components/password-strength";
import ErrorAlertComponent from "../../components/error/ErrorAlertComponent"; // Component for error alerts

export default function RegisterPage({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleRegister = async () => {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const enforceStrongPassword = false;    //If this is true then you need a strong password.

    const passwordStrengthError = evaluatePasswordStrength(password, enforceStrongPassword);
        if (passwordStrengthError) {
      setError(passwordStrengthError);
      return;
    }

    try {
      setLoading(true);
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      navigation.navigate("Verify", {
        username,
        email,
        firstName,
        lastName,
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
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

        {error && <ErrorAlertComponent message={error} />}

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
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
        />
        <PasswordStrength password={password} />
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
