// PostCard.tsx
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View, Image, Text } from "react-native";
import { IPost, IUser } from "../../../interfaces/post-interface";
import PostActions from "./post-action-buttons";
import InnerPostCard from "./inner-post-card";
import ProfileHeaderLink from "../../my-profile/components/profile-image-name-button";
import { useAuth } from "../../../contexts/auth-context";
import EditableText from "./editable-text-for-posts";
import PostOptionsModal from "./post-setting-modal";

interface PostCardProps {
  post: IPost;
  inShareModal?: boolean;
  navigation: any;
  onPostUpdated?: (deletedPost: IPost) => void;
  onPostLiked?: (deletedPost: IPost) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  navigation,
  inShareModal = false,
  onPostUpdated,
  onPostLiked,
}) => {
  const author =
    typeof post.author === "object"
      ? post.author
      : {
          _id: post.author,
          username: post.author,
          profile_picture: { url: "" },
        };

  // Local state to control inline editing and the options modal.
  const [isEditing, setIsEditing] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const handleSaveComplete = (updatedText: string) => {
    // Update post content locally.
    post.content = updatedText;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between p-2">
      <ProfileHeaderLink
        navigation={navigation}
        userId={author._id}
        username={author.username}
        profileImage={author.profile_picture.url}
      />
      <TouchableOpacity
        onPress={() => setOptionsVisible(true)}
        className="w-12 h-12 items-center justify-center rounded-full bg-gray-200"
      >
        <Text className="text-3xl text-gray-600">⋮</Text>
      </TouchableOpacity>
    </View>
  );

  // Render the text content area.
  const renderTextContent = () => {
    return (
      <View className="p-1">
        <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
          {!isEditing ? (
            <Text style={{ fontSize: 16, color: "#374151", marginBottom: 8 }}>
              {post.content || "No content."}
            </Text>
          ) : (
            <EditableText
              text={post.content || ""}
              postId={post._id}
              isEditing={isEditing}
              onSaveComplete={handleSaveComplete}
              onCancel={handleCancel}
              textStyle={{ fontSize: 16, color: "#374151", marginBottom: 8 }}
              containerStyle={{ marginBottom: 16 }}
            />
          )}
        </View>
        <InnerPostCard
          post={post.original_post as IPost}
          navigation={navigation}
        />
      </View>
    );
  };

  const renderContent = () => {
    if (post.is_shared && post.original_post) {
      return <View>{renderTextContent()}</View>;
    } else {
      return (
        <View className="p-2">
          {renderTextContent()}
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

  const renderMeta = () => (
    <View className="px-2 pb-1">
      <Text className="text-xs text-gray-500">
        {new Date(post.created_at).toLocaleString()}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (inShareModal) return null;
    return (
      <PostActions
        post={post}
        navigation={navigation}
        onLikeChangeList={(newLikes) => {
          // Update the local post object with new likes.
          const updatedPost = {
            ...post,
            likes: newLikes as string[] | IUser[],
          };
          // Call the parent's callback to update the post in Home's list.
          if (onPostLiked) onPostLiked(updatedPost);
        }}
      />
    );
  };

  const CardContent = () => (
    <>
      {renderHeader()}
      {renderContent()}
      {renderMeta()}
      {renderFooter()}
      {optionsVisible && (
        <PostOptionsModal
          visible={optionsVisible}
          onClose={() => setOptionsVisible(false)}
          post={post}
          navigation={navigation}
          onEdit={() => setIsEditing(true)}
          onPostUpdated={onPostUpdated}
        />
      )}
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
