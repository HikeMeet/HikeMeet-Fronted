import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
export default function LandingPage({ navigation }: { navigation: any }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-bold mb-6">HikeMeet</Text>
      <Text className="text-center text-gray-600 px-6 mb-8">
        Welcome to HikeMeet, where you can connect with fellow hiking
        enthusiasts.
      </Text>

      <TouchableOpacity
        className="w-48 py-3 bg-blue-500 rounded-lg mb-4"
        onPress={() => navigation.navigate("Login")}
      >
        <Text className="text-center text-white text-lg font-semibold">
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-48 py-3 bg-gray-300 rounded-lg"
        onPress={() => navigation.navigate("Register")}
      >
        <Text className="text-center text-black text-lg font-semibold">
          Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
