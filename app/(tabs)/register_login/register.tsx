import React, { useState } from "react";
import { Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import tw from "tailwind-react-native-classnames";
import { registerUser } from "../../../api/register";
import { useNavigationHelpers } from "../../../navigation/navigation";

export default function RegisterScreen() {
  const { navigateToLogin } = useNavigationHelpers();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleRegister = async () => {
    const result = await registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    if (result.success) {
      Alert.alert("הרשמה הצליחה!", "נרשמת בהצלחה!");
      navigateToLogin();
    } else {
      Alert.alert("שגיאה בהרשמה", result.error || "משהו השתבש");
    }
  };

  return (
    <View style={tw`flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 px-5 justify-center items-center`}>
      <View style={tw`bg-white w-full max-w-md rounded-2xl shadow-lg p-6`}>
        <Text style={tw`text-3xl font-bold text-center mb-6 text-gray-800`}>הרשמה</Text>
        <TextInput
          style={tw`w-full p-4 border border-gray-300 rounded-lg mb-4 text-gray-700`}
          placeholder="שם פרטי"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={tw`w-full p-4 border border-gray-300 rounded-lg mb-4 text-gray-700`}
          placeholder="שם משפחה"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={tw`w-full p-4 border border-gray-300 rounded-lg mb-4 text-gray-700`}
          placeholder="אימייל"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={tw`w-full p-4 border border-gray-300 rounded-lg mb-6 text-gray-700`}
          placeholder="סיסמה"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          style={tw`bg-indigo-500 py-3 rounded-lg shadow-md active:bg-indigo-600`}
          onPress={handleRegister}
        >
          <Text style={tw`text-white text-center font-semibold text-lg`}>הירשם</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToLogin}>
          <Text style={tw`mt-5 text-center text-blue-500 underline`}>
            כבר יש לך חשבון? <Text style={tw`text-indigo-500`}>עבור לדף התחברות</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
