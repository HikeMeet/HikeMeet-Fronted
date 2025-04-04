// PostDetailPage.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import { getPostWithParam, IPost } from "../../interfaces/post-interface";
import { SafeAreaView } from "react-native-safe-area-context";
import PostActions from "./components/post-action-buttons";
import MediaList from "../../components/media-list-after-upload";
import FullScreenMediaModal from "../../components/media-fullscreen-modal";
import { IImageModel } from "../../interfaces/image-interface";
import InnerPostCard from "./components/inner-post-card";
import ProfileHeaderLink from "../my-profile/components/profile-image-name-button";
import PostOptionsModal from "./components/post-setting-modal";
import EditableText from "./components/editable-text-for-posts";
import { useAuth } from "../../contexts/auth-context";

const getUri = (data: any): string => {
  if (typeof data === "string") return data;
  if (
    data &&
    typeof data === "object" &&
    data.uri &&
    typeof data.uri === "string"
  ) {
    return data.uri;
  }
  return "";
};

type PostDetailPageParams = {
  route: { params: { postId: string; fromCreate?: boolean } };
  navigation: any;
};

const PostDetailPage: React.FC<PostDetailPageParams> = ({
  route,
  navigation,
}) => {
  const { postId } = route.params;
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/post/${postId}`
        );
        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const openFullScreen = (index: number) => {
    setSelectedMediaIndex(index);
    setMediaModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-700">Post not found.</Text>
      </SafeAreaView>
    );
  }

  const author = getPostWithParam(post);

  const mediaItems: IImageModel[] = post.images!.map((item) => ({
    url: getUri(item.url),
    image_id: item.image_id,
    type: item.type,
    video_sceenshot_url:
      item.type === "video" ? item.video_sceenshot_url : undefined,
  }));

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="bg-gray-50">
          <View className="p-6 bg-white rounded-lg shadow-md m-4">
            {/* Header with Author and Options Button */}
            <View className="flex-row items-center justify-between">
              <ProfileHeaderLink
                userId={author._id}
                username={author.username}
                profileImage={author.profile_picture.url}
                navigation={navigation}
              />
              <TouchableOpacity
                onPress={() => setOptionsVisible(true)}
                className="w-12 h-12 items-center justify-center rounded-full bg-gray-200"
              >
                <Text className="text-3xl text-gray-600">⋮</Text>
              </TouchableOpacity>
            </View>

            {/* Post Content */}
            <View className="mb-4 px-4">
              {isEditing ? (
                <EditableText
                  text={post.content || ""}
                  postId={post._id}
                  isEditing={isEditing}
                  onSaveComplete={(updatedText: string) => {
                    setPost({ ...post, content: updatedText });
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
                  textStyle={{
                    fontSize: 16,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                  containerStyle={{ marginBottom: 16 }}
                />
              ) : (
                <Text className="text-base text-gray-700 mb-4">
                  {post.content || "No content."}
                </Text>
              )}
            </View>

            {/* Media Section */}
            {mediaItems.length > 0 && (
              <MediaList media={mediaItems} onPressItem={openFullScreen} />
            )}

            {/* Original Post Preview for Shared Posts */}
            {post.is_shared  && (
              <InnerPostCard
                post={post.original_post as IPost}
                navigation={navigation}
              />
            )}
            {/* Post Meta */}
            <Text className="text-sm text-gray-500 mb-2">
              Posted on: {new Date(post.created_at).toLocaleString()}
            </Text>

            {/* Privacy Text */}
            <Text className="text-xs text-gray-400 mb-2">
              Privacy: {post.privacy === "private" ? "Private" : "Public"}
            </Text>
            {/* Post Actions */}
            <PostActions post={post} navigation={navigation} />

            {/* Comments */}
            {post.comments && post.comments.length > 0 && (
              <>
                <Text className="text-base font-semibold my-2 text-gray-800">
                  Comments:
                </Text>
                {post.comments.map((comment, index) => (
                  <View key={index} className="mb-2 p-2 bg-gray-100 rounded">
                    <Text className="text-sm font-bold text-gray-800">
                      {typeof comment.user === "object"
                        ? comment.user.username
                        : comment.user}
                    </Text>
                    <Text className="text-sm text-gray-700">
                      {comment.text}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Fullscreen Modal for Media Preview */}
      <Modal
        visible={mediaModalVisible}
        animationType="slide"
        onRequestClose={() => setMediaModalVisible(false)}
      >
        <FullScreenMediaModal
          media={mediaItems}
          initialIndex={selectedMediaIndex}
          onClose={() => setMediaModalVisible(false)}
        />
      </Modal>

      {/* Options Modal for Post Options (Edit/Delete/Report) */}
      <PostOptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        post={post}
        navigation={navigation}
        onEdit={() => {
          // Instead of navigating to a separate edit screen, toggle inline editing.
          setIsEditing(true);
          setOptionsVisible(false);
        }}
        onPostUpdated={(deletedPost) => {
          // If the post is deleted, navigate back.
          navigation.goBack();
        }}
      />
    </>
  );
};

export default PostDetailPage;
