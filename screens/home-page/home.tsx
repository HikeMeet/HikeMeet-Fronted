import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import CreatePostButton from "../../components/create-post-buton";
import { FIREBASE_AUTH } from '../../firebaseconfig'
import Button from "../../components/Button";

const Home = ({ navigation }: any) => {
  return (
    <View className="flex-1 bg-white">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-300">
        <Text className="text-lg font-bold">HikeMeet</Text>
        <Ionicons name="search" size={24} color="black" />
      </View>

      <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />

      {/* Filters */}
      <View className="flex-row justify-around py-2 border-b border-gray-300">
        <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
          <Text className="text-sm font-medium">Friends Only</Text>
        </TouchableOpacity>
        <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
          <Text className="text-sm font-medium">All</Text>
        </TouchableOpacity>
      </View>

      {/* Create Post */}
      <CreatePostButton
        navigation={navigation}
        location="home"
        onPress={() => console.log("create post clicked")}
      />

      {/* Posts */}
      <ScrollView className="flex-1 px-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((post, index) => (
          <View
            key={index}
            className="mb-4 p-6 bg-gray-100 rounded-lg flex-row justify-between items-center"
          >
            <Text className="text-sm">Post {index}</Text>
            <Ionicons name="create-outline" size={20} color="gray" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default styled(Home);
