import { useEffect, useState } from "react";
import React from "react";
import { View, TouchableOpacity, Text, Modal, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { IComment, IPost, IUser } from "../../../interfaces/post-interface";
import SharePostModal from "./share-post-modal";
import {
  likePost,
  savePost,
  unlikePost,
  unsavePost,
} from "../../../components/requests/post-actions";
import { useAuth } from "../../../contexts/auth-context";
import LikesModal from "./users-liked-list-modal";
import CommentModal from "./commnet-modal";

interface PostActionsProps {
  post: IPost;
  navigation: any;
  onLikeChange?: () => void; // <-- Add this line
  onLikeChangeList?: (newLikes: (IUser | string)[]) => void;
  onCommentsUpdated?: (updatedComments: IComment[]) => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  navigation,
  onLikeChange,
  onLikeChangeList,
  onCommentsUpdated,
}) => {
  const { mongoId, mongoUser } = useAuth();

  // Initialize isLiked and isSaved by checking if mongoId exists in the arrays
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    post.likes.some((like: IUser | string) =>
      typeof like === "string" ? like === mongoId : like._id === mongoId
    )
  );
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    post.saves.includes(mongoId!)
  );
  const [saveCount, setSaveCount] = useState(post.saves.length);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [shareCount, setShareCount] = useState(post.shares.length);
  const [modalVisible, setModalVisible] = useState(false);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  useEffect(() => {
    setCommentCount(post.comments.length);
  }, [post.comments]);

  // Flag to avoid multiple simultaneous like/unlike requests
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const isLikesArrayOfStrings =
    post.likes.length > 0 && typeof post.likes[0] === "string";
  const handleLike = async () => {
    if (isLikeProcessing) return;
    setIsLikeProcessing(true);
    try {
      let newLikes: string[] | IUser[];
      const isLikesArrayOfStrings =
        post.likes.length > 0 && typeof post.likes[0] === "string";

      if (!isLiked) {
        await likePost(post._id, mongoId!);
        if (isLikesArrayOfStrings) {
          // post.likes is string[]
          newLikes = [...(post.likes as string[]), mongoId!];
        } else {
          // post.likes is IUser[]
          newLikes = [
            ...(post.likes as IUser[]),
            {
              _id: mongoId!,
              username: mongoUser?.username!, // Replace with the actual username from context if available
              profile_picture: mongoUser?.profile_picture!,
              first_name: mongoUser?.first_name!,
              last_name: mongoUser?.last_name!,
            },
          ];
        }
        setIsLiked(true);
        setLikeCount(likeCount + 1);
      } else {
        await unlikePost(post._id, mongoId!);
        if (isLikesArrayOfStrings) {
          newLikes = (post.likes as string[]).filter(
            (like) => like !== mongoId
          );
        } else {
          newLikes = (post.likes as IUser[]).filter(
            (like) => like._id !== mongoId
          );
        }
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      }

      if (onLikeChangeList) {
        onLikeChangeList(newLikes);
      }
      if (onLikeChange) {
        onLikeChange();
      }
    } catch (error) {
      console.warn("Cliking to fast", error);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!isSaved) {
        await savePost(post._id, mongoId!);
        setIsSaved(true);
        setSaveCount(saveCount + 1);
      } else {
        await unsavePost(post._id, mongoId!);
        setIsSaved(false);
        setSaveCount(saveCount - 1);
      }
    } catch (error) {
      console.warn("Cliking to fast", error);
    }
  };

  const handleShare = () => {
    console.log("Share pressed");
    setModalVisible(true);
  };

  const handleComment = () => {
    console.log("Comment pressed");
    setCommentModalVisible(true);
  };

  return (
    <View className="border-t border-gray-200 pt-2 mt-2 flex-row justify-evenly items-center">
      {/* Grouping Like Icon and Like Count */}
      <View className="flex-row items-center">
        <TouchableOpacity onPress={handleLike}>
          <FontAwesome
            name={isLiked ? "thumbs-up" : "thumbs-o-up"}
            size={20}
            color={isLiked ? "blue" : "black"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLikesModalVisible(true)}>
          <Text className="text-sm font-bold ml-0.5">{likeCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button (Icon & Text) */}
      <TouchableOpacity onPress={handleSave} className="flex-row items-center">
        <FontAwesome
          name={isSaved ? "bookmark" : "bookmark-o"}
          size={20}
          color={isSaved ? "blue" : "black"}
        />
        <Text className="ml-1 text-sm font-bold">{saveCount}</Text>
      </TouchableOpacity>

      {/* Share Button (Icon & Text) */}
      <TouchableOpacity onPress={handleShare} className="flex-row items-center">
        <FontAwesome name="share" size={20} color="blue" />
        <Text className="ml-1 text-sm font-bold">{shareCount}</Text>
      </TouchableOpacity>

      {/* Comment Button (Icon & Text) */}
      <TouchableOpacity
        onPress={handleComment}
        className="flex-row items-center"
      >
        <FontAwesome name="comment" size={20} color="blue" />
        <Text className="ml-1 text-sm font-bold">{commentCount}</Text>
      </TouchableOpacity>

      {/* Share Modal */}
      {modalVisible && (
        <SharePostModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          post={post}
          inGroup={Boolean(post.in_group)}
          navigation={navigation}
        />
      )}
      {/* Likes Modal */}
      <LikesModal
        visible={likesModalVisible}
        onClose={() => setLikesModalVisible(false)}
        likes={post.likes}
        navigation={navigation}
      />
      {commentModalVisible && (
        <CommentModal
          visible={commentModalVisible}
          onClose={() => setCommentModalVisible(false)}
          postId={post._id}
          initialComments={post.comments}
          navigation={navigation}
          onCommentsUpdated={(updatedComments: IComment[]) => {
            // Update the parent's post data with the new comments
            if (onCommentsUpdated) {
              onCommentsUpdated(updatedComments);
            }
            // Force modal visibility to remain open.
            setCommentModalVisible(true);
          }}
        />
      )}
    </View>
  );
};

export default PostActions;
