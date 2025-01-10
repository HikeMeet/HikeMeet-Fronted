import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  UserCredential,
} from "firebase/auth";
import { useAuth } from "../../contexts/auth-context";
import PasswordStrength, {
  evaluatePasswordStrength,
} from "../../components/password-strength";
import ErrorAlertComponent from "../../components/error/error-alert-component";
import CustomTextInput from "../../components/custom-text-input";
import BackButton from "../../components/back-button";
import Button from "../../components/Button";
import { Icon } from "react-native-paper";

export default function RegisterPage({ navigation }: { navigation: any }) {
  const { setUser, setIsVerified } = useAuth();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleRegister = async () => {
    setError("");

    if (!email || !password || !confirmPassword || !birthdate) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const enforceStrongPassword = false;
    const passwordStrengthError = evaluatePasswordStrength(
      password,
      enforceStrongPassword
    );
    if (passwordStrengthError) {
      setError(passwordStrengthError);
      return;
    }

    try {
      setLoading(true);

      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);

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
        birthdate,
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

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-700"
    >
      <View className="flex-1 items-center justify-center px-6">
        <BackButton onPress={() => navigation.navigate("Landing")} />

        <Text className="text-3xl font-bold text-white mb-4">
          Create an Account
        </Text>
        <Text className="text-lg text-gray-300 mb-6">
          Join us to get started!
        </Text>

        {/* Display error messages */}
        {error && <ErrorAlertComponent message={error} />}

        <CustomTextInput
          iconName="account"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        {/* First and Last Name side by side */}
        <View className="flex-row w-full space-x-4 mb-4">
          <View className="flex-1">
            <CustomTextInput
              iconName="account-outline"
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View className="flex-1">
            <CustomTextInput
              iconName="account-outline"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        {/* Birthdate Field */}
        <CustomTextInput
          iconName="calendar"
          placeholder="Select Your Birthdate"
          value={birthdate ? birthdate.toLocaleDateString() : ""}
          onChangeText={() => setShowDatePicker(true)} // Trigger DatePicker on touch
          onPress={() => setShowDatePicker(true)} // Trigger DatePicker on touch
        />
        {showDatePicker && (
          <DateTimePicker
            value={birthdate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()} // Prevent future dates
          />
        )}

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

        <Button
          title="Register"
          onPress={handleRegister}
          isLoading={loading}
          color="bg-green-600"
        />

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
