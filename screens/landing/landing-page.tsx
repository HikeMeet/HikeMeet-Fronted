import React = require("react");
import { View, Text, TouchableOpacity, Image } from "react-native";

export default function LandingPage({ navigation }: { navigation: any }) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-3">
      {/* Logo Image */}
      <Image
        source={require("../../assets/Logo2.png")} // עדכן את הנתיב ללוגו שלך
        style={{
          width: 120, // רוחב הלוגו
          height: 120, // גובה הלוגו
          marginBottom: 20, // ריווח מתחת ללוגו
          borderRadius: 60, // עיגול הלוגו (אם תרצה)
        }}
        resizeMode="contain" // התאמת התמונה לגבולות
      />

      {/* Title */}
      <Text className="text-4xl font-bold mb-6">HikeMeet</Text>
      <Text className="text-center text-gray-600 px-6 mb-8">
        Welcome to HikeMeet, where you can connect with fellow hiking
        enthusiasts.
      </Text>

      {/* Login Button */}
      <TouchableOpacity
        className="w-48 py-3 bg-blue-500 rounded-lg mb-4"
        onPress={() => navigation.navigate("Login", { toResetPassword: false })}
      >
        <Text className="text-center text-white text-lg font-semibold">
          Login
        </Text>
      </TouchableOpacity>

      {/* Register Button */}
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
