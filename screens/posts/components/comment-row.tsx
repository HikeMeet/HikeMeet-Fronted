// CommentRow.tsx
import { useState, useEffect } from "react";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import ProfileHeaderLink from "../../my-profile/components/profile-image-name-button";
import { IComment, IUser } from "../../../interfaces/post-interface";
import {
  likeComment,
  unlikeComment,
  deleteComment, // Ensure this is implemented in your API requests
} from "../../../components/requests/post-comment-requests";
import { useAuth } from "../../../contexts/auth-context";
import LikesModal from "./users-liked-list-modal";
import ConfirmationModal from "../../../components/confirmation-modal";
import ParsedMentionText from "./parsed-mention-text";

interface CommentRowProps {
  comment: IComment;
  postId: string;
  navigation: any;
  onCommentUpdated?: (updatedComment: IComment) => void;
  isTemporary?: boolean; // new prop
}

const CommentRow: React.FC<CommentRowProps> = ({
  comment,
  postId,
  navigation,
  onCommentUpdated,
  isTemporary,
}) => {
  const { mongoId, mongoUser } = useAuth();

  // Local state for likes
  const [isLiked, setIsLiked] = useState(
    comment.liked_by!.some((like: IUser | string) =>
      typeof like === "string" ? like === mongoId : like._id === mongoId
    )
  );
  const [likeCount, setLikeCount] = useState(comment.liked_by?.length || 0);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  // Local state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Update local like state if the prop changes.
  useEffect(() => {
    const updatedIsLiked = comment.liked_by!.some((like: IUser | string) =>
      typeof like === "string" ? like === mongoId : like._id === mongoId
    );
    setIsLiked(updatedIsLiked);
    setLikeCount(comment.liked_by?.length || 0);
  }, [comment.liked_by, mongoId]);

  // Normalize user field to IUser
  const getUser = (user: IUser | string): IUser => {
    return typeof user === "object"
      ? user
      : {
          _id: user,
          username: user,
          profile_picture: {
            url: "https://via.placeholder.com/150",
            image_id: "",
          },
        };
  };

  const author = getUser(comment.user);

  const handleLikeToggle = async () => {
    if (isLikeProcessing) return;
    setIsLikeProcessing(true);
    try {
      let newLikedBy: IUser[];
      if (!isLiked) {
        await likeComment(postId, comment._id, mongoId!);
        newLikedBy = [...((comment.liked_by as IUser[]) || []), mongoUser!];
        setIsLiked(true);
        setLikeCount(likeCount + 1);
      } else {
        await unlikeComment(postId, comment._id, mongoId!);
        newLikedBy = (comment.liked_by as IUser[]).filter(
          (user: IUser) => user._id !== mongoId
        );
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      }
      const updatedComment: IComment = {
        ...comment,
        liked_by: newLikedBy,
      };
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment);
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(postId, comment._id, mongoId!);

      if (onCommentUpdated) {
        // Parent should remove the comment from its list.
        onCommentUpdated({ ...comment, deleted: true } as IComment);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <View className="flex-row items-start p-4 border-b border-gray-300">
      <View className="flex-1 ml-4">
        <ProfileHeaderLink
          userId={author._id}
          username={author.username}
          profileImage={author.profile_picture!.url}
          navigation={navigation}
        />
        <ParsedMentionText
          text={comment.text || "No content."}
          navigation={navigation}
        />
        <Text className="text-xs text-gray-500 mt-1">
          {new Date(comment.created_at).toLocaleString()}
        </Text>
      </View>
      <View className="flex-col items-center justify-center self-center">
        <TouchableOpacity onPress={handleLikeToggle}>
          <FontAwesome
            name={isLiked ? "thumbs-up" : "thumbs-o-up"}
            size={20}
            color={isLiked ? "blue" : "black"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLikesModalVisible(true)}>
          <Text className="text-base font-bold mt-2">{likeCount}</Text>
        </TouchableOpacity>
      </View>
      {/* Only show the delete icon if the comment belongs to the current user */}
      {(author._id === mongoId || mongoUser?.role === "admin") && (
        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          className="self-center ml-4"
        >
          <FontAwesome name="trash" size={20} color="red" />
        </TouchableOpacity>
      )}
      <LikesModal
        visible={likesModalVisible}
        onClose={() => setLikesModalVisible(false)}
        likes={comment.liked_by || []}
        navigation={navigation}
      />
      <ConfirmationModal
        visible={showDeleteModal}
        message="Are you sure you want to delete this comment?"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
};

export default CommentRow;
