import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
}

const SearchFilters: React.FC<Props> = ({ filter, setFilter }) => {
  const options = ["All", "Hikes", "Groups", "Trip"];

  return (
    <View className="flex-row border-b border-gray-200 mb-2 px-4">
      {options.map((item) => {
        const isActive = filter === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            className={`flex-1 px-4 py-2 border-b-2 ${
              isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default SearchFilters;
