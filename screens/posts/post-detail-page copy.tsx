import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
  Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { IPost } from "../../interfaces/post-interface";
import { SafeAreaView } from "react-native-safe-area-context";
import PostActions from "./components/post-action-buttons";
import MediaList from "../../components/media-list-after-upload";
import FullScreenMediaModal from "../../components/media-fullscreen-modal";
import { IImageModel } from "../../interfaces/image-interface";
import InnerPostCard from "./components/inner-post-card";

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
  route: {
    params: { postId: string; fromCreate?: boolean };
  };
  navigation: any;
};

const PostDetailPage: React.FC<PostDetailPageParams> = ({
  route,
  navigation,
}) => {
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const { postId } = route.params;

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
    setModalVisible(true);
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

  const authorProfilePic = getUri(
    typeof post.author === "object" ? post.author.profile_picture.url : ""
  );

  // Convert post.images into an array of IImageModel
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
            {/* Author Section */}
            <View className="flex-row items-center mb-4">
              {authorProfilePic ? (
                <Image
                  source={{ uri: authorProfilePic }}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
              )}
              <Text className="text-lg font-bold text-gray-800">
                {typeof post.author === "object"
                  ? post.author.username
                  : post.author}
              </Text>
            </View>

            {/* Post Content */}
            {post.content && (
              <Text className="text-base text-gray-700 mb-4">
                {post.content}
              </Text>
            )}

            {/* Media Section */}
            {mediaItems.length > 0 && (
              <MediaList media={mediaItems} onPressItem={openFullScreen} />
            )}

            {/* Post Meta */}
            <Text className="text-sm text-gray-500 mb-2">
              Posted on: {new Date(post.created_at).toLocaleString()}
            </Text>

            {/* Privacy Text */}
            <Text className="text-xs text-gray-400 mb-2">
              Privacy: {post.privacy === "private" ? "Private" : "Public"}
            </Text>

            {/* Original Post Preview for Shared Posts */}
            {post.is_shared && post.original_post && (
              <InnerPostCard
                post={post.original_post as IPost}
                navigation={navigation}
              />
            )}

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
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <FullScreenMediaModal
          media={mediaItems}
          initialIndex={selectedMediaIndex}
          onClose={() => setModalVisible(false)}
        />
      </Modal>
    </>
  );
};

export default PostDetailPage;
