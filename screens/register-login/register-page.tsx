/// <reference types="nativewind/types" />

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

export default function RegisterPage(/*{ navigation }: { navigation: any }*/) {
  const [step, setStep] = useState(1); // Controls step 1 or step 2
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNext = () => {
    if (name.trim() === "") {
      Alert.alert("Error", "Please enter your name or email.");
      return;
    }
    setStep(2);
  };

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    Alert.alert("Success", "Registration Complete!");
    // navigation.navigate("Home"); // Redirect to HomePage after registration
  };

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white">
      {step === 1 && (
        <>
          <Text className="text-2xl font-bold mb-6">Register to HikeMeet</Text>
          <Text className="text-base text-gray-600 mb-8">part 1</Text>

          <Text className="text-lg mb-2">Enter your name/E-mail</Text>
          <TextInput
            placeholder="Your Name"
            className="w-full border border-gray-400 rounded-lg px-4 py-2 mb-6"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity
            className="bg-blue-500 py-3 w-64 rounded-lg"
            onPress={handleNext}
          >
            <Text className="text-center text-white text-lg">Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text className="text-2xl font-bold mb-6">Register to HikeMeet</Text>
          <Text className="text-base text-gray-600 mb-8">part 2</Text>

          <Text className="text-lg mb-2">Enter your password</Text>
          <View className="w-full mb-6">
            <TextInput
              placeholder="Password"
              secureTextEntry
              className="w-full border border-gray-400 rounded-lg px-4 py-2"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Text className="text-lg mb-2">Confirm your password</Text>
          <View className="w-full mb-6">
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              className="w-full border border-gray-400 rounded-lg px-4 py-2"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            className="bg-green-500 py-3 w-64 rounded-lg"
            onPress={handleRegister}
          >
            <Text className="text-center text-white text-lg">
              Get Confirmation and Register
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
