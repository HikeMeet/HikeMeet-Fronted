import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native";

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
import GenderDropdown from "../../components/gender-dropdown";
import TermsPopup from "../../components/turms-and-conditions";
import CustomCheckbox from "../../components/custom-checkbox";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

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
      console.log("gender", gender);
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
    // <ScrollView className="flex-1 bg-gray-100">
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-700"
    >
        <BackButton onPress={() => navigation.goBack()} />

        <Text className="text-3xl font-bold text-white mb-1 mt-20 ml-20">
          Create an Account
        </Text>
        <Text className="text-lg text-gray-300 mb-2" style={{ marginLeft: 120 }} // מרווח של 120 פיקסלים
        >
         Join us to get started!
        </Text>
        {/* Display error messages */}
        {error && <ErrorAlertComponent message={error} />}
        <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
            className="flex-1 px-4 mt-5"
            contentContainerStyle={{
            paddingBottom: 20,
            paddingHorizontal: 10,
          }}
          scrollEventThrottle={16}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          
          <CustomTextInput
            iconName="account"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />

          {/* First and Last Name Fields */}
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

          {/* Gender Dropdown */}
          <GenderDropdown
            iconName="gender-male-female"
            value={gender}
            onValueChange={setGender}
          />

{/* Birthdate Field */}
<TouchableOpacity
  onPress={() => setShowDatePicker(true)}
  className="flex-row items-center justify-between border border-gray-400 px-4 py-3 bg-white rounded-lg mb-4 shadow-sm"
>
  <Text
    className={`text-base font-semibold ${
      birthdate ? "text-gray-900" : "text-gray-500"
    }`}
  >
    {birthdate
      ? `${birthdate.getDate()}/${birthdate.getMonth() + 1}/${birthdate.getFullYear()}`
      : "Select Your Birthdate"}
  </Text>
  <Icon name="calendar" size={24} color="#ff" />
</TouchableOpacity>

{/* Date Picker for Android */}
{showDatePicker && Platform.OS === "android" && (
  <DateTimePicker
    value={birthdate || new Date()}
    mode="date"
    display="default" // Ensures default Android calendar view
    onChange={(event, selectedDate) => {
      if (event.type === "set") {
        setBirthdate(selectedDate || birthdate); // Save the selected date
      }
      setShowDatePicker(false); // Close picker
    }}
    maximumDate={new Date()} // Restrict future dates
  />
)}


{/* Default DateTimePicker for iOS */}
{showDatePicker && Platform.OS === "ios" && (
  <View className="mb-4 bg-white rounded-lg shadow-lg p-4">
    <Text className="text-center text-lg font-bold text-gray-700 mb-2">
      Select Your Birthdate
    </Text>
    <DateTimePicker
      value={birthdate || new Date()}
      mode="date"
      display="spinner"
      onChange={(event, selectedDate) => {
        setBirthdate(selectedDate || birthdate);
      }}
      maximumDate={new Date()}
    />
    <TouchableOpacity
      onPress={() => setShowDatePicker(false)}
      className="bg-blue-500 rounded-md p-3 mt-3"
    >
      <Text className="text-center text-white font-bold">Confirm</Text>
    </TouchableOpacity>
  </View>
)}



          {/* Email Field */}
          <CustomTextInput
            iconName="email"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password Fields */}
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

          {/* Terms & Conditions */}
          <View className="flex-row items-center mb-4">
            <CustomCheckbox
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              label="I accept the Terms & Conditions"
            />
            <TouchableOpacity onPress={() => setTermsVisible(true)}>
              <Text className="text-green-300 font-bold ml-2">
                Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms Popup */}
          <TermsPopup
            visible={termsVisible}
            onClose={() => setTermsVisible(false)}
          />

          {/* Register Button */}
          <Button
            title="Register"
            onPress={handleRegister}
            isLoading={loading}
            color="bg-green-500"
          />
        </ScrollView>

                {/* Navigate to Login */}
                <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            className="md-10"
          >
            <Text className="text-center text-gray-500">
              Already have an account?{" "}
              <Text className="text-green-500 font-bold">Log in here</Text>
            </Text>
          </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
    </KeyboardAvoidingView>
    // </ScrollView>
    );
  };
