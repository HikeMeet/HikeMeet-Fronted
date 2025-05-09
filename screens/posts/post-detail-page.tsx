// PostDetailPage.tsx
import { useEffect, useState, useCallback } from "react";
import React from "react";
import {
  ActivityIndicator,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getPostWithParam,
  IComment,
  IPost,
} from "../../interfaces/post-interface";
import PostActions from "./components/post-action-buttons";
import MediaList from "../../components/media-list-after-upload";
import FullScreenMediaModal from "../../components/media-fullscreen-modal";
import { IImageModel } from "../../interfaces/image-interface";
import InnerPostCard from "./components/inner-post-card";
import ProfileHeaderLink from "../my-profile/components/profile-image-name-button";
import PostOptionsModal from "./components/post-setting-modal";
import EditableText from "./components/editable-text-for-posts";

import ParsedMentionText from "./components/parsed-mention-text";
import SelectedGroupsList from "./components/attached-group-preview";
import SelectedTripsList from "./components/attached-trip-preview";
import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";
import { ScrollView } from "react-native-gesture-handler";

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
    params: {
      postId: string;
      fromCreate?: boolean;
      onPostUpdated?: (p: IPost) => void;
    };
  };
  navigation: any;
};

const PostDetailPage: React.FC<PostDetailPageParams> = ({
  route,
  navigation,
}) => {
  const { postId,onPostUpdated } = route.params;
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [commentsToShow, setCommentsToShow] = useState<number>(5);

  

  const fetchPost = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/${postId}`
      );
      const data = await response.json();
      setPost(data.post);
      onPostUpdated?.(data.post);
    } catch (error) {
      console.error("Error fetching post details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // When a comment is updated (e.g., liked), update it in the post's comments list.

  const openFullScreen = (index: number) => {
    setSelectedMediaIndex(index);
    setMediaModalVisible(true);
  };

  const loadMoreComments = useCallback(() => {
    if (post && commentsToShow < post.comments.length) {
      setCommentsToShow((prev) => prev + 5);
    }
  }, [post, commentsToShow]);

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
        <Text className="text-lg text-gray-700">
          Post not available or deleted.
        </Text>
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

  // Header component for FlatList: contains post details and post actions
  const ListHeader = () => (
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
          />
        ) : (
          <ParsedMentionText
            text={post.content || "No content."}
            navigation={navigation}
          />
        )}
      </View>
      {/* Preview of attached groups */}
      <SelectedGroupsList
        groups={post.attached_groups as Group[]}
        navigation={navigation}
      />
      {/* Preview of attached trips */}
      <SelectedTripsList
        trips={post.attached_trips as Trip[]}
        navigation={navigation}
      />
      {/* Media Section */}
      {mediaItems.length > 0 && (
        <MediaList media={mediaItems} onPressItem={openFullScreen} />
      )}
      {/* Original Post Preview for Shared Posts */}
      {post.is_shared && (
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
      <PostActions
        post={post}
        navigation={navigation}
        onLikeChange={fetchPost}
        onCommentsUpdated={(updatedComments: IComment[]) => {
          setPost((prev) =>
            prev ? { ...prev, comments: updatedComments } : prev
          );
          // Optionally adjust commentsToShow if needed
        }}
      />
    </View>
  );

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50 ">
        <ScrollView className="flex-1">
          {ListHeader()}

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
              setIsEditing(true);
              setOptionsVisible(false);
            }}
            onPostUpdated={(deletedPost) => {
              navigation.goBack();
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default PostDetailPage;
