import { useState, useEffect, useCallback, useMemo } from "react";
import React = require("react");
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import CreatePostButton from "../posts/components/create-post-buton";
import BioSection from "./components/profile-bio-section";
import HikerButton from "../../components/profile-hikers-button";
import ProfileImage from "../../components/profile-image";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";
import { IPost } from "../../interfaces/post-interface";
import PostCard from "../posts/components/post-card-on-feeds";
import { fetchPostsForUser } from "../../components/requests/fetch-posts";
import HikersList from "../../components/hikers-list-in-profile";

const ProfilePage = ({ navigation }: any) => {
  const { mongoUser } = useAuth();
  const [showHikers, setShowHikers] = useState<boolean>(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);

  const toggleHikers = () => {
    setShowHikers((prev) => !prev);
  };

  // Always call hooks in the same order!
  useFocusEffect(
    useCallback(() => {
      setShowHikers(false);
    }, [])
  );

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const fetchedPosts = await fetchPostsForUser(mongoUser!);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts for user:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (mongoUser) {
      fetchPosts();
    }
  }, [mongoUser]);

  // Always call useMemo, even if mongoUser is null.
  const memoizedHeader = useMemo(() => {
    if (!mongoUser) return null;
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        {/* Profile Header */}
        <View className="flex-row items-center p-4 bg-white">
          <ProfileImage
            initialImage={mongoUser.profile_picture}
            size={80}
            id={mongoUser._id}
            uploadType="profile"
          />
          <View className="flex-1 ml-5">
            <Text className="text-lg font-bold">{mongoUser.username}</Text>
            <Text className="text-sm font-bold">{`${mongoUser.first_name} ${mongoUser.last_name}`}</Text>
            <Text className="text-sm text-gray-500">Rank: Adventurer</Text>
            <HikerButton
              showHikers={showHikers}
              toggleHikers={toggleHikers}
              user={mongoUser}
            />
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AccountStack", { screen: "Settings" })
            }
            style={{ alignSelf: "flex-start" }}
          >
            <Icon name="settings" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {/* Bio and Create Post Section */}
        <View className="p-4 bg-white">
          <BioSection bio={mongoUser.bio} />
        </View>
      </>
    );
  }, [mongoUser, showHikers]);

  // Early return if there is no user.
  if (!mongoUser) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text>Failed to load user data.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfilePage")}
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {showHikers ? (
          <HikersList
            isMyProfile={true}
            navigation={navigation}
            profileId={mongoUser._id}
            headerComponent={memoizedHeader!} // Pass the memoized header
          />
        ) : (
          <FlatList
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View className="p-2">
                <PostCard
                  post={item}
                  navigation={navigation}
                  onPostUpdated={(deletedPost) => {
                    setPosts((prevPosts) =>
                      prevPosts.filter((p) => p._id !== deletedPost._id)
                    );
                  }}
                  onPostLiked={(updatedPost: IPost) => {
                    setPosts((prevPosts) =>
                      prevPosts.map((p) =>
                        p._id === updatedPost._id ? updatedPost : p
                      )
                    );
                  }}
                />
              </View>
            )}
            ListHeaderComponent={
              <>
                {memoizedHeader}
                <View className="h-px bg-gray-300 my-4" />
                <CreatePostButton
                  navigation={navigation}
                  location="home"
                  onPress={() => console.log("create post clicked")}
                />
              </>
            }
            ListEmptyComponent={
              loadingPosts ? (
                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={loadingPosts}
                onRefresh={fetchPosts}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default styled(ProfilePage);
