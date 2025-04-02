import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";
import BioSection from "../../components/profile-bio-section";
import CreatePostButton from "../posts/components/create-post-buton";
import HikerButton from "../../components/profile-hikers-button";
import HikersList from "../../components/hikers-list-in-profile";
import ProfileImage from "../../components/profile-image";

const ProfilePage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { mongoUser } = useAuth();
  const [showHikers, setShowHikers] = useState<boolean>(false);

  const toggleHikers = () => {
    setShowHikers((prev) => !prev);
  };

  useFocusEffect(
    useCallback(() => {
      setShowHikers(false);
    }, [])
  );

  if (!mongoUser) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Failed to load user data.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfilePage")}
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Text className="text-xl font-bold">Profile</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("AccountStack", { screen: "Settings" })
          }
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2099/2099058.png",
            }}
            className="w-6 h-6"
          />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View className="flex-row items-center p-4">
        <ProfileImage
          initialImageUrl={mongoUser.profile_picture.url}
          size={80}
          id={mongoUser._id}
          uploadType={"profile"}
        />
        <View className="flex-1 ml-5">
          <Text className="text-lg font-bold">{mongoUser.username}</Text>
          <Text className="text-lg font-bold">{`${mongoUser.first_name} ${mongoUser.last_name}`}</Text>
          <Text className="text-sm text-gray-500">Rank: Adventurer</Text>
          <HikerButton
            showHikers={showHikers}
            toggleHikers={toggleHikers}
            user={mongoUser}
          />
        </View>
      </View>

      {showHikers ? (
        // In ProfilePage.tsx (own profile), pass your own ID (e.g., mongoUser._id)
        <HikersList
          isMyProfile={true}
          navigation={navigation}
          profileId={mongoUser!._id}
        />
      ) : (
        <ScrollView className="flex-1 p-4">
          <BioSection bio={mongoUser.bio} />
          <View className="h-px bg-gray-300 my-4" />

          <CreatePostButton
            navigation={navigation}
            location="home"
            onPress={() => console.log("create post clicked")}
          />

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(
            (post, index) => (
              <View
                key={index}
                className="mb-4 p-6 bg-gray-100 rounded-lg flex-row justify-between items-center"
              >
                <Text className="text-sm">Post {index}</Text>
                <Ionicons name="create-outline" size={20} color="gray" />
              </View>
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ProfilePage;
