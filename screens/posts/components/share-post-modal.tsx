import React, { useState } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import PostCard from "./post-card-on-feeds";
import { useAuth } from "../../../contexts/auth-context";

interface SharePostModalProps {
  visible: boolean;
  onClose: () => void;
  post: any; // Replace with your IPost type if available
  inGroup: boolean;
}

const SharePostModal: React.FC<SharePostModalProps> = ({
  visible,
  onClose,
  post,
  inGroup,
}) => {
  const [commentary, setCommentary] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const { mongoId } = useAuth();

  const handleShare = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/share`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: mongoId,
            content: commentary,
            original_post: post._id,
            images: [],
            attached_trip: null,
            attached_group: post.attached_group || null,
            in_group: inGroup ? post.in_group : undefined,
            privacy: inGroup ? "private" : privacy,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        console.log("Post shared successfully", data);
        setCommentary("");
        onClose();
      } else {
        console.error("Error sharing post", data.error);
        Alert.alert("Error", data.error || "Failed to share post.");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      Alert.alert("Error", "Something went wrong while sharing the post.");
    }
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      avoidKeyboard={false} // Do not avoid keyboard, let it overlay the modal
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      className="m-0 justify-center items-center"
    >
      <View className="bg-white rounded-lg w-11/12 max-h-full p-4">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* Text Input for additional commentary */}
          <TextInput
            value={commentary}
            onChangeText={setCommentary}
            placeholder="Add your commentary..."
            className="border border-gray-300 rounded p-2 mb-4"
            multiline
          />
          {/* Privacy Options (only if not in a group) */}
          {!inGroup && (
            <>
              <Text className="text-lg font-semibold mb-2">Privacy:</Text>
              <View className="flex-row mb-4">
                <TouchableOpacity
                  className={`p-3 rounded border ${
                    privacy === "public"
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setPrivacy("public")}
                >
                  <Text
                    className={`${
                      privacy === "public" ? "text-white" : "text-black"
                    }`}
                  >
                    Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`p-3 rounded ml-4 border ${
                    privacy === "private"
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setPrivacy("private")}
                >
                  <Text
                    className={`${
                      privacy === "private" ? "text-white" : "text-black"
                    }`}
                  >
                    Private
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {/* Display the post preview using PostCard, unclickable */}
          <PostCard post={post} navigation={null} inShareModal={true} />
        </ScrollView>
        {/* Share Post Button */}
        <TouchableOpacity
          onPress={handleShare}
          className="bg-blue-500 py-3 rounded mt-4"
        >
          <Text className="text-white text-center font-semibold">
            Share Post
          </Text>
        </TouchableOpacity>
        {/* Cancel Button */}
        <TouchableOpacity onPress={onClose} className="mt-2">
          <Text className="text-center text-gray-500">Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SharePostModal;
