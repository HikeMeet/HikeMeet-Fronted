import React from "react";
import { Text, TouchableOpacity, GestureResponderEvent } from "react-native";

interface CreatePostButtonProps {
  location: "home" | "profile" | "group"; // Only accepts "home" or "profile"
  onPress?: (event: GestureResponderEvent) => void; // Optional press handler
  navigation: any;
  inGroup?: boolean;
  groupId?: string;
}

const CreatePostButton: React.FC<CreatePostButtonProps> = ({
  location,
  onPress,
  navigation,
  inGroup = false,
  groupId,
}) => {
  return (
    <TouchableOpacity
      className={"mx-2 my-2 py-3 rounded-lg bg-blue-500"}
      onPress={() => {
        if (inGroup) {
          navigation.navigate("PostStack", {
            screen: "CreatePostPage",
            params: { inGroup, groupId },
          });
        } else {
          navigation.navigate("PostStack");
        }
      }}
    >
      <Text className="text-center text-white font-semibold">
        + Create Post
      </Text>
    </TouchableOpacity>
  );
};

export default CreatePostButton;
