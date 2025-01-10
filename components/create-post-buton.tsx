import React from "react";
import { Text, TouchableOpacity, GestureResponderEvent } from "react-native";

interface CreatePostButtonProps {
  location: "home" | "profile"; // Only accepts "home" or "profile"
  onPress?: (event: GestureResponderEvent) => void; // Optional press handler
}

const CreatePostButton: React.FC<CreatePostButtonProps> = ({
  location,
  onPress,
}) => {
  // Dynamic background color based on location
  const buttonColor = location === "home" ? "bg-blue-500" : "bg-green-500";

  return (
    <TouchableOpacity
      className={`mx-2 my-2 py-3 rounded-lg ${buttonColor}`}
      onPress={onPress}
    >
      <Text className="text-center text-white font-semibold">
        + Create Post
      </Text>
    </TouchableOpacity>
  );
};

export default CreatePostButton;
