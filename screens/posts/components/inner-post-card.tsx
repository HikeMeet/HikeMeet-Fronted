import React from "react";
import { TouchableOpacity, View, Text, Image, ScrollView } from "react-native";
import { IPost } from "../../../interfaces/post-interface";

interface InnerPostCardProps {
  post: IPost;
  navigation: any; // Pass null to disable clicking.
}

const InnerPostCard: React.FC<InnerPostCardProps> = ({ post, navigation }) => {
  // Extract author details.
  const author =
    typeof post.author === "object"
      ? post.author
      : { username: post.author, profile_picture: { url: "" } };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation &&
        navigation.push("PostStack", {
          screen: "PostPage",
          params: { postId: post._id },
        })
      }
      disabled={!navigation}
      className="bg-gray-50 p-2 rounded-md my-1 ml-4 border border-gray-200"
    >
      <View className="flex-row items-center mb-1">
        {author.profile_picture?.url ? (
          <Image
            source={{ uri: author.profile_picture.url }}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <View className="w-6 h-6 rounded-full bg-gray-400" />
        )}
        <Text className="ml-2 text-sm font-semibold text-gray-900">
          {author.username}
        </Text>
      </View>
      {post.content ? (
        <Text className="text-sm text-gray-700 mb-1">{post.content}</Text>
      ) : null}
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {post.images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: typeof img.url === "string" ? img.url : "" }}
              className="w-20 h-20 rounded-md mr-2"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
    </TouchableOpacity>
  );
};

export default InnerPostCard;
