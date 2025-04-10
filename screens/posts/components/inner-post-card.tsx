import React from "react";
import { TouchableOpacity, View, Text, Image, ScrollView } from "react-native";
import { getPostWithParam, IPost } from "../../../interfaces/post-interface";
import ProfileHeaderLink from "../../my-profile/components/profile-image-name-button";
import ParsedMentionText from "./parsed-mention-text";

interface InnerPostCardProps {
  post?: IPost; // Allow post to be optional for this check.
  navigation: any; // Pass null to disable clicking.
}

const InnerPostCard: React.FC<InnerPostCardProps> = ({ post, navigation }) => {
  // If post is unavailable, show message.
  if (!post || post === null) {
    return (
      <View className="bg-gray-50 p-2 rounded-md my-1 ml-4 border border-gray-200 flex justify-center items-center">
        <Text className="text-sm text-gray-700 text-center">
          Shared post is unavailable
        </Text>
      </View>
    );
  }

  // Extract author details.
  const author = getPostWithParam(post);

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
      <ProfileHeaderLink
        navigation={navigation}
        userId={author._id}
        username={author.username}
        profileImage={author.profile_picture.url}
      />
      {post.content ? (
        <ParsedMentionText
          text={post.content || "No content."}
          navigation={navigation}
        />
      ) : null}
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {post.images.map((img, idx) => {
            const isVideo = img.type === "video";
            const previewUrl = isVideo ? img.video_sceenshot_url : img.url;
            return (
              <Image
                key={idx}
                source={{ uri: previewUrl }}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 12,
                  marginRight: 8,
                }}
                resizeMode="cover"
              />
            );
          })}
        </ScrollView>
      )}
      <View className="px-2 pb-1">
        <Text className="text-xs text-gray-500">
          {new Date(post.created_at).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default InnerPostCard;
