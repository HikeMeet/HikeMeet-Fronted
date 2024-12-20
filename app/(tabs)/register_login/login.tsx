import React, { useState } from "react";
import { Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import tw from "tailwind-react-native-classnames";
import { loginUser } from "../../../api/login";
import { useNavigationHelpers } from "../../../navigation/navigation";

export default function LoginScreen() {
  const { navigateToHome, navigateToRegister } = useNavigationHelpers();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות");
      return;
    }

    const result = await loginUser({
      email,
      password,
    });

    if (result.success && result.token) {
      // שמירת הטוקן ב-AsyncStorage (או כל מנגנון אחסון אחר)
      // לדוגמה:
      // await AsyncStorage.setItem("token", result.token);

      Alert.alert("התחברות הצליחה!", "ברוך הבא!", [
        { text: "אישור", onPress: navigateToHome },
      ]);
    } else {
      Alert.alert("שגיאה בהתחברות", result.error || "משהו השתבש");
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-gradient-to-b from-blue-500 to-purple-600 px-5`}>
      <View style={tw`bg-white w-full max-w-md p-6 rounded-2xl shadow-lg -mt-20`}>
        <Text style={tw`text-2xl font-bold text-center mb-5 text-gray-800`}>התחברות</Text>
        <TextInput
          style={tw`w-full p-4 border border-gray-300 rounded-lg mb-4 text-gray-700`}
          placeholder="אימייל"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={tw`w-full p-4 border border-gray-300 rounded-lg mb-4 text-gray-700`}
          placeholder="סיסמה"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          style={tw`bg-blue-500 py-3 rounded-lg shadow-md active:bg-blue-600`}
          onPress={handleLogin}
        >
          <Text style={tw`text-white text-center font-semibold text-lg`}>התחבר</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={tw`mt-5 text-blue-500 underline text-center`}>
            עוד לא נרשמת? <Text style={tw`text-indigo-500`}>עבור לדף הרשמה</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
