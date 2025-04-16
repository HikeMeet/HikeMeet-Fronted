import React = require("react");
import { View, Text } from "react-native";

interface DateDisplayProps {
  dateParts: string[];
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ dateParts }) => {
  return (
    <View className="flex-row items-center space-x-1">
      {dateParts.map((date, i) => (
        <React.Fragment key={i}>
          <View className="px-2 py-1 border border-gray-200 rounded">
            <Text className="text-gray-800">{date}</Text>
          </View>
          {i < dateParts.length - 1 && (
            <Text className="text-gray-800 font-semibold">/</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};
