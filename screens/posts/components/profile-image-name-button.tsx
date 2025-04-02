import React from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import { useAuth } from "../../../contexts/auth-context";
import { IPost } from "../../../interfaces/post-interface";
interface ProfileHeaderLinkProps {
  post: IPost;
  navigation: any;
}

const ProfileHeaderLink: React.FC<ProfileHeaderLinkProps> = ({
  post,
  navigation,
}) => {
  const { mongoId } = useAuth();
  const author =
    typeof post.author === "object"
      ? post.author
      : {
          _id: post.author,
          username: post.author,
          profile_picture: { url: "" },
        };

  const handlePress = () => {
    if (author._id === mongoId) {
      navigation.push("Tabs", { screen: "Profile" });
    } else {
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId: author._id },
      });
    }
  };

  return (
    <View className="flex-row items-center p-2 justify-between">
      <TouchableOpacity onPress={handlePress} className="flex-row items-center">
        {author.profile_picture?.url ? (
          <Image
            source={{ uri: author.profile_picture.url }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-300" />
        )}
        <Text className="ml-2 font-bold text-base text-gray-900">
          {author.username}
        </Text>
      </TouchableOpacity>
      <Text className="text-xs text-gray-500">
        {new Date(post.created_at).toLocaleString()}
      </Text>
    </View>
  );
};

export default ProfileHeaderLink;
