import React = require("react");
import { View, Image, TouchableOpacity, Text } from "react-native";

export interface ILocalMedia {
  uri: string;
  type: "image" | "video";
}

interface SelectedMediaListProps {
  media: ILocalMedia[];
  onRemove: (index: number) => void;
}

const SelectedMediaList: React.FC<SelectedMediaListProps> = ({
  media,
  onRemove,
}) => {
  return (
    <View className="flex-row flex-wrap mb-4">
      {media.map((item, index) => (
        <View key={index} className="mr-2 mb-2">
          <Image source={{ uri: item.uri }} className="w-20 h-20 rounded" />
          <TouchableOpacity
            className="absolute top-0 right-0 bg-black/50 rounded-full p-0.5"
            onPress={() => onRemove(index)}
          >
            <Text className="text-white text-xs">X</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default SelectedMediaList;
