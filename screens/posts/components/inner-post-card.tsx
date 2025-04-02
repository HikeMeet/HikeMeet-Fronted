import React from "react";
import { TouchableOpacity, View, Text, Image, ScrollView } from "react-native";
import { IPost } from "../../../interfaces/post-interface";
import ProfileHeaderLink from "./profile-image-name-button";

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
      <ProfileHeaderLink post={post} navigation={navigation} />
      {post.content ? (
        <Text className="text-sm text-gray-700 mb-1">{post.content}</Text>
      ) : null}
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {post.images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: typeof img.url === "string" ? img.url : "" }}
              className="w-32 h-32 rounded-md mr-2"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
    </TouchableOpacity>
  );
};

export default InnerPostCard;
