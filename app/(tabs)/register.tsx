import { Text, TextInput, View, Button, TouchableOpacity } from "react-native";
import tw from "tailwind-react-native-classnames";

export default function RegisterScreen() {
  return (
    <View style={tw`flex-1 items-center justify-center bg-white px-5`}>
      <Text style={tw`text-2xl font-bold mb-5`}>הרשמה</Text>
      <TextInput
        style={tw`w-full p-3 border border-gray-300 rounded mb-3`}
        placeholder="שם מלא"
      />
      <TextInput
        style={tw`w-full p-3 border border-gray-300 rounded mb-3`}
        placeholder="hello"
        keyboardType="email-address"
      />
      <TextInput
        style={tw`w-full p-3 border border-gray-300 rounded mb-3`}
        placeholder="סיסמה"
        secureTextEntry
      />
      <Button title="הירשם" onPress={() => alert("נרשמת בהצלחה!")} />
      <TouchableOpacity>
        <Text style={tw`mt-5 text-blue-500 underline`}>
          כבר יש לך חשבון? עבור לדף התחברות
        </Text>
      </TouchableOpacity>
    </View>
  );
}
