// PostDetailPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  Image,
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
import { useAuth } from "../../contexts/auth-context";
import { createComment } from "../../components/requests/post-comment-requests";
import CommentRow from "./components/comment-row";
import ParsedMentionText from "./components/parsed-mention-text";
import MentionTextInput from "../../components/metion-with-text-input";
import SelectedGroupsList from "./components/attached-group-preview";
import SelectedTripsList from "./components/attached-trip-preview";
import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";

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
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [commentsToShow, setCommentsToShow] = useState<number>(5);
  const { mongoId } = useAuth();

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

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // When a comment is updated (e.g., liked), update it in the post's comments list.
  const handleCommentUpdated = (updatedComment: IComment) => {
    if (!post) return;
    const updatedComments = post.comments.map((c) =>
      c._id === updatedComment._id ? updatedComment : c
    );
    setPost({ ...post, comments: updatedComments });
  };

  // Handle posting a new comment
  const handlePostComment = async () => {
    if (!newCommentText.trim() || !post) return;
    try {
      const addedComment: IComment = await createComment(
        post._id,
        mongoId!,
        newCommentText
      );
      const updatedComments = [...post.comments, addedComment];
      setPost({ ...post, comments: updatedComments });
      setNewCommentText("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

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
      />

      {/* Comments Section Title */}
      <View className="mt-4 mb-2 px-4">
        <Text className="text-base font-semibold text-gray-800">Comments:</Text>
      </View>
    </View>
  );

  // Data for FlatList: paginated comments
  const displayedComments = post.comments.slice(0, commentsToShow);

  return (
    <>
      <SafeAreaView className="flex-auto bg-gray-50 ">
        <FlatList
          data={displayedComments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <CommentRow
              comment={item}
              postId={post._id}
              navigation={navigation}
              onCommentUpdated={handleCommentUpdated}
            />
          )}
          ListHeaderComponent={ListHeader}
          onEndReached={loadMoreComments}
          onEndReachedThreshold={0.1}
          contentContainerStyle={{ paddingBottom: 180 }}
        />

        {/* Sticky Input for New Comment */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row items-center p-4"
        >
          <MentionTextInput
            placeholder="Write a comment..."
            value={newCommentText}
            onChangeText={setNewCommentText}
            inputStyle={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 8,
              fontSize: 16,
              color: "#374151",
            }}
            containerStyle={{ flex: 1 }}
          />
          <TouchableOpacity
            onPress={handlePostComment}
            className="ml-2 bg-blue-500 rounded-lg p-2"
          >
            <Text className="text-white">Send</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

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
      </SafeAreaView>
    </>
  );
};

export default PostDetailPage;
