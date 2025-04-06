import React from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import CommentModal from "./components/commnet-modal";
import { IComment } from "../../interfaces/post-interface";

const CommentScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId, initialComments } = route.params as {
    postId: string;
    initialComments: IComment[];
  };

  return (
    <CommentModal
      visible={true}
      onClose={() => navigation.goBack()}
      postId={postId}
      initialComments={initialComments}
      navigation={navigation}
      onCommentsUpdated={() => {}}
    />
  );
};

export default CommentScreen;
