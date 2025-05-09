// PostOptionsModal.tsx
import { useState } from "react";
import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import { useAuth } from "../../../contexts/auth-context";
import { IPost } from "../../../interfaces/post-interface";
import ConfirmationModal from "../../../components/confirmation-modal";

interface PostOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  post: IPost;
  navigation: any;
  onEdit: () => void;
  // Callback to notify parent of a deletion so it can remove the post from the list.
  onPostUpdated?: (deletedPost: IPost) => void;
}

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * PostOptionsModal is a modal component that provides options for interacting with a post.
 * It allows authors or admins to edit or delete their post and all users to report a post.
 * It also supports callbacks to notify the parent component of changes.
 *
 * Props:
 * - visible: Controls the visibility of the modal.
 * - onClose: Callback to close the modal.
 * - post: The post object for which options are being displayed.
 * - navigation: Navigation object for navigating between screens.
 * - onEdit: Callback to trigger inline editing of the post.
 * - onPostUpdated: Callback to notify parent when the post is updated or deleted.
 */

/*******  be9f35af-734a-4d9f-b7d0-e893ae80f941  *******/
const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  visible,
  onClose,
  post,
  navigation,
  onEdit,
  onPostUpdated,
}) => {
  const { mongoId, mongoUser } = useAuth();
  // Extract author ID whether post.author is an object or a string.
  const authorId =
    typeof post.author === "object" ? post.author._id : post.author;
  const isAuthor = authorId === mongoId;

  // Local state for the confirmation modal and deletion loading.
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Delete post using the DELETE route.
  const handleDelete = async () => {
    setConfirmVisible(false);
    setDeleting(true);
    try {
      console.log("Deleting post:", post._id);
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/${post._id}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: mongoId }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Post deleted successfully", data.post);
        if (onPostUpdated) onPostUpdated(data.post);
        setConfirmVisible(false);
        onClose();
      } else {
        console.error("Error deleting post:", data.error);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeleting(false);
    }
  };

  // When user taps "Delete Post", show the confirmation modal.
  const handleDeletePress = () => {
    setConfirmVisible(true);
  };

  // Called when user confirms deletion.

  // Called when user cancels deletion.
  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  const handleReport = () => {
    onClose();
    console.log("Report post");
  };

  return (
    <>
      <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        className="m-0 justify-center items-center"
      >
        <View className="bg-white rounded-lg w-3/4 p-4">
          {isAuthor ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  onEdit(); // Trigger inline editing in parent.
                  onClose();
                }}
                className="py-2 border-b border-gray-200"
              >
                <Text className="text-center text-blue-500 font-semibold">
                  Edit Post
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleReport} className="py-2">
              <Text className="text-center text-red-500 font-semibold">
                Report Post
              </Text>
            </TouchableOpacity>
          )}
          {(mongoUser?.role === "admin" || isAuthor) && (
            <TouchableOpacity onPress={handleDeletePress} className="py-2">
              <Text className="text-center text-red-500 font-semibold">
                Delete Post
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} className="mt-4">
            <Text className="text-center text-gray-500">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <ConfirmationModal
        visible={confirmVisible}
        message="Are you sure you want to delete this post?"
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />
      {deleting && (
        <View className="mt-2">
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      )}
    </>
  );
};

export default PostOptionsModal;
