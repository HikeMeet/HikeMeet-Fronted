import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface UserTripProps {
  route: any;
  navigation: any;
}
const TripsPage: React.FC<UserTripProps> = ({ route, navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* Top row: Search and filter */}
      <View className="flex-row items-center mb-4">
        <View className="flex-1 mr-2 bg-gray-100 rounded-full px-3 py-2">
          <TextInput placeholder="Search trip" className="text-base" />
        </View>

        <TouchableOpacity className="p-2 bg-gray-200 rounded-full">
          {/* Replace with an icon if you like */}
          <Text className="text-sm">Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons row: Trip History and + Add trip */}
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded">
          <Text className="text-white font-semibold">Trip History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 px-4 py-2 rounded"
          onPress={() => navigation.navigate("CreateTripPage")}
        >
          <Text className="text-white font-semibold">+ Add trip</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable list of trips */}
      <ScrollView>
        {/* Example static items (replace with data from your backend) */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <View
            key={item}
            className="flex-row items-center bg-gray-100 mb-4 p-4 rounded-lg"
          >
            {/* Placeholder image - you could use an <Image> with a real source */}
            <View className="w-16 h-16 bg-gray-300 mr-4 rounded" />

            <Text className="text-lg">Trip {item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripsPage;
