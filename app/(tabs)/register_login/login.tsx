import React from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigationHelpers } from "../../../navigation/navigation";

export default function LoginScreen() {
  const { navigateToHome } = useNavigationHelpers();

  return (
    <View style={tw`flex-1 justify-center items-center bg-gradient-to-b from-blue-500 to-purple-600 px-5`}>
      <View style={tw`bg-white w-full max-w-md p-6 rounded-2xl shadow-lg -mt-20`}>
        <Text style={tw`text-2xl font-bold text-center mb-5 text-gray-800`}>התחברות</Text>
        <TextInput
          style={tw`w-full p-4 border border-gray-300 rounded-lg mb-4 text-gray-700`}
          placeholder="אימייל"
          keyboardType="email-address"
        />
        <TextInput
          style={tw`w-full p-4 border border-gray-300 rounded-lg mb-4 text-gray-700`}
          placeholder="סיסמה"
          secureTextEntry
        />
        <TouchableOpacity
          style={tw`bg-blue-500 py-3 rounded-lg shadow-md active:bg-blue-600`}
          onPress={() => alert("ברוך הבא!")}
        >
          <Text style={tw`text-white text-center font-semibold text-lg`}>התחבר</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToHome}>
          <Text style={tw`mt-5 text-blue-500 underline text-center`}>
            עוד לא נרשמת? עבור לדף הרשמה
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
