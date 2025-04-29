import React from "react";
import { View, Text } from "react-native";

const EmptyResults = () => (
  <View className="flex-1 justify-center items-center mt-10">
    <Text className="text-gray-500 text-base">No results found.</Text>
  </View>
);

export default EmptyResults;
