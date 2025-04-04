import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { IPost } from "../../../interfaces/post-interface";
import SharePostModal from "./share-post-modal";
import {
  likePost,
  savePost,
  unlikePost,
  unsavePost,
} from "../../../components/requests/post-actions";
import { useAuth } from "../../../contexts/auth-context";

interface PostActionsProps {
  post: IPost;
  navigation: any;
}

const PostActions: React.FC<PostActionsProps> = ({ post, navigation }) => {
  const { mongoId } = useAuth();

  // Initialize isLiked and isSaved by checking if mongoId exists in the arrays
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    post.likes.includes(mongoId!)
  );
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    post.saves.includes(mongoId!)
  );
  const [saveCount, setSaveCount] = useState(post.saves.length);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLike = async () => {
    try {
      if (!isLiked) {
        await likePost(post._id, mongoId!);
        setIsLiked(true);
        setLikeCount(likeCount + 1);
      } else {
        await unlikePost(post._id, mongoId!);
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      }
    } catch (error) {
      console.error("Error handling like:", error);
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
      console.error("Error handling save:", error);
    }
  };

  const handleShare = () => {
    console.log("Share pressed");
    setModalVisible(true);
  };

  const handleComment = () => {
    console.log("Comment pressed");
  };

  return (
    <View className="border-t border-gray-200 pt-2 mt-2 flex-row justify-evenly items-center">
      <TouchableOpacity onPress={handleLike} className="flex-row items-center">
        <FontAwesome
          name={isLiked ? "thumbs-up" : "thumbs-o-up"}
          size={20}
          color={isLiked ? "blue" : "black"}
        />
        <Text className="ml-1 text-sm">{likeCount}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSave} className="flex-row items-center">
        <FontAwesome
          name={isSaved ? "bookmark" : "bookmark-o"}
          size={20}
          color={isSaved ? "blue" : "black"}
        />
        <Text className="ml-1 text-sm">{saveCount}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleShare} className="flex-row items-center">
        <FontAwesome name="share" size={20} color="blue" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleComment}
        className="flex-row items-center"
      >
        <FontAwesome name="comment" size={20} color="blue" />
        <Text className="ml-1 text-sm">{post.comments.length}</Text>
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
    </View>
  );
};

export default PostActions;
