import { useState } from "react";
import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
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
import Button from "../../components/Button";
import GenderDropdown from "../../components/gender-dropdown";
import TermsPopup from "../../components/turms-and-conditions";
import CustomCheckbox from "../../components/custom-checkbox";

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
  const [gender, setGender] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const handleRegister = async () => {
    setError("");

    if (!email || !password || !confirmPassword || !birthdate) {
      setError("Please fill in all fields.");
      return;
    }

    // Validate age
    const today = new Date();
    const birthDate = new Date(birthdate);
    const age = today.getFullYear() - birthDate.getFullYear();
    const isBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (age < 18 || (age === 18 && !isBirthdayPassed)) {
      setError("You must be at least 18 years old to register.");
      return;
    }
    if (gender === "") {
      setError("No gender");
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
    if (!acceptTerms) {
      setError("You must accept the Terms & Conditions to register.");
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
        birthdate: birthdate ? birthdate.toISOString() : null,
        gender,
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
    <>
      <SafeAreaView className="flex-1 bg-slate-700">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-3xl font-bold text-white text-center mt-4">
              Create an Account
            </Text>
            <Text className="text-lg text-gray-300 text-center mb-6">
              Join us to get started!
            </Text>

            {error && (
              <View className="mb-4">
                <ErrorAlertComponent message={error} />
              </View>
            )}

            <View className="bg-white rounded-2xl p-3 shadow-lg mx-auto w-full max-w-md">
              {/* Username */}
              <View className="mb-4">
                <CustomTextInput
                  iconName="account"
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              {/* First + Last */}
              <View className="flex-row space-x-4 mb-4">
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

              {/* Gender */}
              <View className="mb-4">
                <GenderDropdown
                  iconName="gender-male-female"
                  value={gender}
                  onValueChange={setGender}
                />
              </View>

              {/* Birthdate */}
              <View className="mb-4">
                <CustomTextInput
                  iconName="calendar"
                  placeholder="Select Your Birthdate"
                  value={birthdate ? birthdate.toLocaleDateString() : ""}
                  onPress={() => setShowDatePicker(true)}
                  onFocus={() => setShowDatePicker(true)}
                  showSoftInputOnFocus={false}
                  editable={false}
                  onChangeText={function (text: string): void {
                    throw new Error("Function not implemented.");
                  }}
                />

                {showDatePicker && (
                  <DateTimePicker
                    testID="birthdate-picker"
                    value={birthdate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* Email */}
              <View className="mb-4">
                <CustomTextInput
                  iconName="email"
                  placeholder="Email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View className="mb-4">
                <CustomTextInput
                  iconName="lock"
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <PasswordStrength password={password} />

              {/* Confirm Password */}
              <View className="mb-4">
                <CustomTextInput
                  iconName="lock"
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Terms & Conditions */}
              <View className="flex-row items-center mb-4">
                <CustomCheckbox
                  checked={acceptTerms}
                  onChange={() => setAcceptTerms(!acceptTerms)}
                  label="I accept the Terms & Conditions"
                />
                <TouchableOpacity onPress={() => setTermsVisible(true)}>
                  <Text className="text-green-600 font-bold ml-2">
                    View Terms
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <View className="mb-4">
                <Button
                  title="Register"
                  onPress={handleRegister}
                  isLoading={loading}
                  color="bg-green-600"
                />
              </View>

              {/* Switch to Login */}
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                className="mt-2"
              >
                <Text className="text-center text-gray-600">
                  Already have an account?{" "}
                  <Text className="text-green-600 font-bold">Log in here</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <TermsPopup
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
      />
    </>
  );
}
