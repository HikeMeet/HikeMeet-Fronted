// components/PostCard.tsx
import React from "react";
import { ScrollView, TouchableOpacity, View, Image, Text } from "react-native";
import { getPostWithParam, IPost } from "../../../interfaces/post-interface";
import PostActions from "./post-action-buttons";
import InnerPostCard from "./inner-post-card";
import { useAuth } from "../../../contexts/auth-context";
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
  const author = getPostWithParam(post);

  // Render header.
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
          <Text style={{ padding: 8, fontSize: 16, color: "#111827" }}>
            {post.content}
          </Text>
          {/* Render the shared chain using InnerPostCard */}
          <InnerPostCard
            post={post.original_post as IPost}
            navigation={navigation}
          />
        </View>
      );
    } else {
      return (
        <View style={{ padding: 8 }}>
          {post.content ? (
            <Text style={{ fontSize: 16, color: "#111827", marginBottom: 8 }}>
              {post.content}
            </Text>
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
        </View>
      );
    }
  };

  // Render footer.
  const renderFooter = () => {
    if (inShareModal) return null;
    return <PostActions post={post} navigation={navigation} />;
  };

  const CardContent = () => (
    <>
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </>
  );

  const containerStyle = {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  };

  return navigation ? (
    <TouchableOpacity
      onPress={() =>
        navigation.push("PostStack", {
          screen: "PostPage",
          params: { postId: post._id },
        })
      }
      style={containerStyle}
    >
      <CardContent />
    </TouchableOpacity>
  ) : (
    <View style={containerStyle}>
      <CardContent />
    </View>
  );
};

export default PostCard;
