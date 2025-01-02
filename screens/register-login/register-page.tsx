import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import ErrorMessage from "../../components/error/ErrorMessage";
import PasswordStrength, { evaluatePasswordStrength } from "../../components/password-strength";
import { handleRegisterService } from "../../api/auth/handleRegisterService";

export default function RegisterPage({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleRegisterSubmit = async () => {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordStrengthError = evaluatePasswordStrength(password);
    if (passwordStrengthError) {
      setError(passwordStrengthError);
      return;
    }

    setLoading(true);
    try {
      setLoading(true);
      await handleRegisterService(email, password, username, firstName, lastName);
      navigation.navigate("Login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-700"
    >
      <View className="flex-1 items-center justify-center px-6">
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

        {error && <ErrorMessage message={error} />}

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
        <TextInput
          className="w-full p-4 bg-white border border-gray-300 rounded-lg mb-6 text-gray-800"
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#aaa"
        />

        <PasswordStrength password={password} />

        <TouchableOpacity
          className={`w-full p-4 rounded-lg ${loading ? "bg-green-400" : "bg-green-600"}`}
          onPress={handleRegisterSubmit}
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
