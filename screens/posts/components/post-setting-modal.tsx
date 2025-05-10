// PostOptionsModal.tsx
import { useState } from "react";
import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import { useAuth } from "../../../contexts/auth-context";
import { IPost } from "../../../interfaces/post-interface";
import ConfirmationModal from "../../../components/confirmation-modal";
import ReportPopup from "../../admin-settings/components/report-popup"; // עדכן לפי המיקום האמיתי

interface PostOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  post: IPost;
  navigation: any;
  onEdit: () => void;
  // Callback to notify parent of a deletion so it can remove the post from the list.
  onPostUpdated?: (deletedPost: IPost) => void;
}



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
  const [showReportPopup, setShowReportPopup] = useState(false);

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
    setTimeout(() => {
      setShowReportPopup(true);
    }, 250);
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

      <ReportPopup
        visible={showReportPopup}
        onClose={() => setShowReportPopup(false)}
        targetId={post._id}
        targetType="post"
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
