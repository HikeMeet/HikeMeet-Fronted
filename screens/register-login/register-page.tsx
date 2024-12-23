/// <reference types="nativewind/types" />

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

export default function RegisterPage(/*{ navigation }: { navigation: any }*/) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (name.trim() === "") {
      Alert.alert("Error", "Please enter your name or email.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    Alert.alert("Success", "Registration Complete!");
    // navigation.navigate("Home"); // Redirect to HomePage after registration
  };

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-6">Register to HikeMeet</Text>
      <Text className="text-base text-gray-600 mb-8">
        Fill in the details below
      </Text>

      <Text className="text-lg mb-2">Enter your name/E-mail</Text>
      <TextInput
        placeholder="Your Name"
        className="w-full border border-gray-400 rounded-lg px-4 py-2 mb-6"
        value={name}
        onChangeText={setName}
      />

      <Text className="text-lg mb-2">Enter your password</Text>
      <TextInput
        placeholder="Password"
        secureTextEntry
        className="w-full border border-gray-400 rounded-lg px-4 py-2 mb-6"
        value={password}
        onChangeText={setPassword}
      />

      <Text className="text-lg mb-2">Confirm your password</Text>
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        className="w-full border border-gray-400 rounded-lg px-4 py-2 mb-6"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        className="bg-green-500 py-3 w-64 rounded-lg"
        onPress={handleRegister}
      >
        <Text className="text-center text-white text-lg">Register</Text>
      </TouchableOpacity>
    </View>
  );
}
