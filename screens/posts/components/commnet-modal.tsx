// CommentModal.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import CommentRow from "./comment-row";
import { IComment } from "../../../interfaces/post-interface";
import { createComment } from "../../../components/requests/post-comment-requests";
import { useAuth } from "../../../contexts/auth-context";
import MentionTextInput from "../../../components/metion-with-text-input";
import React from "react";

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  initialComments: IComment[];
  navigation: any;
  onCommentsUpdated?: (updatedComments: IComment[]) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  postId,
  initialComments,
  navigation,
  onCommentsUpdated,
}) => {
  // State for the original comments (from props) and new temporary comments
  const [originalComments, setOriginalComments] =
    useState<IComment[]>(initialComments);
  const [tempComments, setTempComments] = useState<IComment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [commentsToShow, setCommentsToShow] = useState<number>(5);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const { mongoId } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  // When initialComments prop changes, update original comments.
  useEffect(() => {
    setOriginalComments(initialComments);
    setCommentsToShow(5);
  }, [initialComments]);

  // Function to post a new comment.
  const handlePostComment = async () => {
    if (!newCommentText.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const addedComment: IComment = await createComment(
        postId,
        mongoId!,
        newCommentText
      );
      // Add the new comment to tempComments (so it appears at the top)
      setTempComments((prev) => [addedComment, ...prev]);
      setNewCommentText("");
      // Auto-scroll to top so the new comment is visible
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error("Error posting comment:", error);
      Alert.alert(
        "Error",
        "There was an error posting your comment. Please try again."
      );
    } finally {
      setIsPosting(false);
    }
  };

  // Handler for updating an individual comment (like updates or deletion).
  const handleCommentUpdated = (updatedComment: IComment) => {
    // First, update in originalComments
    let updatedOriginal = originalComments.map((comment) =>
      comment._id === updatedComment._id ? updatedComment : comment
    );
    // Also update in tempComments if present
    let updatedTemp = tempComments.map((comment) =>
      comment._id === updatedComment._id ? updatedComment : comment
    );
    // If the comment is flagged as deleted, remove it from both arrays.
    if ((updatedComment as any).deleted) {
      updatedOriginal = updatedOriginal.filter(
        (comment) => comment._id !== updatedComment._id
      );
      updatedTemp = updatedTemp.filter(
        (comment) => comment._id !== updatedComment._id
      );
    }
    setOriginalComments(updatedOriginal);
    setTempComments(updatedTemp);
  };

  // Pagination: Load more comments from originalComments.
  const loadMoreComments = useCallback(() => {
    if (commentsToShow < originalComments.length) {
      setCommentsToShow((prev) => prev + 5);
    }
  }, [commentsToShow, originalComments.length]);

  // Display new comments at the top, then a slice of the original comments.
  const displayedComments = [
    ...tempComments,
    ...originalComments.slice(0, commentsToShow),
  ];

  // On modal close, merge tempComments into originalComments by appending them.
  // This preserves the server order for subsequent openings.
  const handleClose = () => {
    const updatedComments = [...originalComments, ...tempComments];
    if (onCommentsUpdated) {
      onCommentsUpdated(updatedComments);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <View className="h-[85%] bg-gray-50">
          {/* Modal Header */}
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <Text className="text-xl font-bold">Comments</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-blue-500">Close</Text>
            </TouchableOpacity>
          </View>
          {/* Comments List */}
          <FlatList
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            ref={flatListRef}
            data={displayedComments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CommentRow
                comment={item}
                postId={postId}
                navigation={navigation}
                onCommentUpdated={handleCommentUpdated}
                isTemporary={tempComments.some((c) => c._id === item._id)}
              />
            )}
            onEndReached={loadMoreComments}
            onEndReachedThreshold={0.1}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
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
        </View>
      </View>
    </Modal>
  );
};

export default CommentModal;
