import React from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import tw from "tailwind-react-native-classnames";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/landing_page.jpg")} // עדכן לנתיב התמונה שלך
      style={tw`flex-1 justify-center items-center`}
      resizeMode="cover" // מתאים את התמונה למסך
    >
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50 w-full h-full`}>
        <Text style={tw`text-4xl font-bold text-white mb-5`}>HikeMeet</Text>
        <Text style={tw`text-lg text-white mb-6`}>ברוך הבא לאפליקציית הטיולים שלך!</Text>

        <View style={tw`bg-white bg-opacity-90 rounded-lg p-6 shadow-lg`}>
          <TouchableOpacity
            style={tw`bg-blue-500 py-3 px-5 rounded mb-4`}
            onPress={() => router.push("/register_login/login")}
          >
            <Text style={tw`text-white font-semibold text-center text-lg`}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-green-500 py-3 px-5 rounded`}
            onPress={() => router.push("/register_login/register")}
          >
            <Text style={tw`text-white font-semibold text-center text-lg`}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
