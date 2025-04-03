import React from "react";
import { ScrollView, TouchableOpacity, View, Image, Text } from "react-native";
import { IPost } from "../../../interfaces/post-interface";
import PostActions from "./post-action-buttons";
import InnerPostCard from "./inner-post-card";
import ProfileHeaderLink from "../../my-profile/components/profile-image-name-button";

interface PostCardProps {
  post: IPost;
  inShareModal?: boolean;
  navigation: any; // Pass null for non-clickable preview (e.g., in share modal)
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  navigation,
  inShareModal = false,
}) => {
  // Extract author details.
  const author =
    typeof post.author === "object"
      ? post.author
      : {
          _id: post.author,
          username: post.author,
          profile_picture: { url: "" },
        };

  // Render header using ProfileHeaderLink.
  const renderHeader = () => (
    <ProfileHeaderLink
      navigation={navigation}
      userId={author._id}
      username={author.username}
      profileImage={author.profile_picture.url}
    />
  );

  // Render content.
  const renderContent = () => {
    if (post.is_shared && post.original_post) {
      return (
        <View>
          {/* New commentary by sharing user */}
          <Text className="p-2 text-base text-gray-900">{post.content}</Text>
          {/* Render the shared chain using InnerPostCard */}
          <InnerPostCard
            post={post.original_post as IPost}
            navigation={navigation}
          />
        </View>
      );
    } else {
      return (
        <View className="p-2">
          {post.content ? (
            <Text className="text-base text-gray-900 mb-2">{post.content}</Text>
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
                    className="w-40 h-40 rounded-xl mr-2"
                    resizeMode="cover"
                  />
                );
              })}
            </ScrollView>
          )}
        </View>
      );
    }
  };

  // Render meta information (date) above the footer.
  const renderMeta = () => (
    <View className="px-2 pb-1">
      <Text className="text-xs text-gray-500">
        {new Date(post.created_at).toLocaleString()}
      </Text>
    </View>
  );

  // Render footer: action buttons.
  const renderFooter = () => {
    if (inShareModal) return null;
    return <PostActions post={post} navigation={navigation} />;
  };

  const CardContent = () => (
    <>
      {renderHeader()}
      {renderContent()}
      {renderMeta()}
      {renderFooter()}
    </>
  );

  return navigation ? (
    <TouchableOpacity
      onPress={() =>
        navigation.push("PostStack", {
          screen: "PostPage",
          params: { postId: post._id },
        })
      }
      className="bg-white rounded-2xl border border-gray-200 shadow-md mb-4"
    >
      <CardContent />
    </TouchableOpacity>
  ) : (
    <View className="bg-white rounded-2xl border border-gray-200 shadow-md mb-4">
      <CardContent />
    </View>
  );
};

export default PostCard;
