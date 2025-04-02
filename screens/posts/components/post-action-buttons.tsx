import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { IPost } from "../../../interfaces/post-interface";
import SharePostModal from "./share-post-modal";

interface PostActionsProps {
  post: IPost;
  navigation: any;
}

const PostActions: React.FC<PostActionsProps> = ({ post, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Handles when the like button is pressed on a post.
   * @remarks Currently just logs to the console but will eventually make a
   * request to the server to like the post.
   */
/******  01220775-ced6-473a-ab5c-2b1deca26c45  *******/  const handleLike = () => {
    console.log("Like pressed");
  };

  const handleShare = () => {
    console.log("Share pressed");
    setModalVisible(true);
  };

  const handleSave = () => {
    console.log("Save pressed");
  };

  const handleComment = () => {
    console.log("Comment pressed");
  };

  return (
    <View className="border-t border-gray-200 pt-2 mt-2 flex-row justify-evenly items-center">
      <TouchableOpacity onPress={handleLike} className="flex-row items-center">
        <FontAwesome name="thumbs-up" size={20} color="black" />
        <Text className="ml-1 text-sm">{post.likes.length}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleShare} className="flex-row items-center">
        <FontAwesome name="share" size={20} color="black" />
        <Text className="ml-1 text-sm">{post.shares.length}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSave} className="flex-row items-center">
        <FontAwesome name="bookmark" size={20} color="black" />
        <Text className="ml-1 text-sm">{post.saves.length}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleComment}
        className="flex-row items-center"
      >
        <FontAwesome name="comment" size={20} color="black" />
        <Text className="ml-1 text-sm">{post.comments.length}</Text>
      </TouchableOpacity>

      {/* Share Modal */}
      {modalVisible && (
        <SharePostModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          post={post}
          inGroup={Boolean(post.in_group)}
        />
      )}
    </View>
  );
};

export default PostActions;
