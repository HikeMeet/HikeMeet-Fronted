import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  UserCredential,
} from "firebase/auth";
import { useAuth } from "../../contexts/AuthContext";
import PasswordStrength, { evaluatePasswordStrength } from "../../components/password-strength";
import ErrorAlertComponent from "../../components/error/ErrorAlertComponent";
import CustomTextInput from "../../components/CustomTextInput";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";

export default function RegisterPage({ navigation }: { navigation: any }) {
  const { setUser, setIsVerified } = useAuth();
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

    const enforceStrongPassword = false;
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
      setUser(user);
      setIsVerified(false);

      // Send verification email
      await sendEmailVerification(user);
      navigation.navigate("Verify", {
        username,
        email,
        firstName,
        lastName,
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please use another email.");
      } else {
        setError(error.message || "Something went wrong.");
      }
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
        <BackButton onPress={() => navigation.navigate("Landing")} />

        <Text className="text-3xl font-bold text-white mb-4">Create an Account</Text>
        <Text className="text-lg text-gray-300 mb-6">Join us to get started!</Text>

        {/* Display error messages */}
        {error && <ErrorAlertComponent message={error} />}

        <CustomTextInput
          iconName="account"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <CustomTextInput
          iconName="account-outline"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <CustomTextInput
          iconName="account-outline"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <CustomTextInput
          iconName="email"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <CustomTextInput
          iconName="lock"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <PasswordStrength password={password} />
        <CustomTextInput
          iconName="lock"
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button title="Register" onPress={handleRegister} isLoading={loading} color="bg-green-600" />

        <TouchableOpacity onPress={() => navigation.navigate("Login")} className="mt-6">
          <Text className="text-gray-300">
            Already have an account?{" "}
            <Text className="text-green-300 font-bold">Log in here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
