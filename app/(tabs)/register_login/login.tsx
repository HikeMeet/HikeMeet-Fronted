import { Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <View className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 justify-center items-center">
      <View className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-6">התחברות</Text>
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 text-gray-700"
          placeholder="אימייל"
          keyboardType="email-address"
          placeholderTextColor="#aaa"
        />
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg mb-6 text-gray-700"
          placeholder="סיסמה"
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          onPress={login}
          className="bg-indigo-500 py-3 rounded-lg shadow-md active:bg-indigo-600"
        >
          <Text className="text-white text-center font-semibold text-lg">התחבר</Text>
        </TouchableOpacity>
        <Text className="mt-6 text-center text-gray-600">
          עוד לא נרשמת?{' '}
          <Text className="text-indigo-500 underline">עבור לדף הרשמה</Text>
        </Text>
      </View>
    </View>
  );
}
