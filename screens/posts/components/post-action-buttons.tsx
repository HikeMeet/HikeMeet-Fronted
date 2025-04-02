// components/PostActions.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface PostActionsProps {
  likes: number;
  shares: number;
  saves: number;
  onLike: () => void;
  onShare: () => void;
  onSave: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  likes,
  shares,
  saves,
  onLike,
  onShare,
  onSave,
}) => {
  return (
    <View className="flex-row items-center space-x-4 mt-4">
      <TouchableOpacity onPress={onLike} className="flex-row items-center">
        <FontAwesome name="thumbs-up" size={24} color="black" />
        <Text className="ml-2 text-base">{likes}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onShare} className="flex-row items-center">
        <FontAwesome name="share" size={24} color="black" />
        <Text className="ml-2 text-base">{shares}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSave} className="flex-row items-center">
        <FontAwesome name="save" size={24} color="black" />
        <Text className="ml-2 text-base">{saves}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PostActions;
