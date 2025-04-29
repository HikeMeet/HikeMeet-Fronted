import React from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface Props {
  loadingMore: boolean;
  canLoadMore: boolean;
  onPress: () => void;
}

const SearchFooter: React.FC<Props> = ({
  loadingMore,
  canLoadMore,
  onPress,
}) => {
  if (!canLoadMore) return null;

  return (
    <View className="mt-4 mb-8 items-center">
      {loadingMore ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <TouchableOpacity
          onPress={onPress}
          className="px-6 py-2 bg-blue-500 rounded-full"
        >
          <Text className="text-white font-semibold">See More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchFooter;
