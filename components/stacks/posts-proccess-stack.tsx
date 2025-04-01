import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CreatePostPage from "../../screens/posts/post-creation-page";
import PostDetailPage from "../../screens/posts/post-detail-page copy";

const Stack = createNativeStackNavigator();

const PostStack = () => {
  return (
    <Stack.Navigator initialRouteName="CreatePostPage">
      <Stack.Screen
        name="CreatePostPage"
        component={CreatePostPage}
        options={{ title: "Create Post", headerShown: false }}
      />
      <Stack.Screen
        name="PostPage"
        component={PostDetailPage as React.ComponentType<any>}
        options={{ title: "Post Page", headerShown: false }}
      />
      {/* <Stack.Screen
        name="EditGroupPage"
        component={EditGroupPage as React.ComponentType<any>}
        options={{ title: "Edit Group", headerShown: false }}
      /> */}
    </Stack.Navigator>
  );
};

export default PostStack;
