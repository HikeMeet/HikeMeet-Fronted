import React from "react";
import { Text, TouchableOpacity, GestureResponderEvent } from "react-native";

interface CreatePostButtonProps {
  location: "home" | "profile"; // Only accepts "home" or "profile"
  onPress?: (event: GestureResponderEvent) => void; // Optional press handler
  navigation: any;
}

const CreatePostButton: React.FC<CreatePostButtonProps> = ({
  location,
  onPress,
  navigation,
}) => {
  return (
    <TouchableOpacity
      className={`mx-2 my-2 py-3 rounded-lg bg-blue-500`}
      onPress={() => navigation.navigate("CreatePost")}
    >
      <Text className="text-center text-white font-semibold">
        + Create Post
      </Text>
    </TouchableOpacity>
  );
};

export default CreatePostButton;
