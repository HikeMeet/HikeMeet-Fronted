import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import CreatePostButton from "../../components/create-post-buton";

const Home = ({ navigation }: any) => {
  return (
    <View className="flex-1 bg-white">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-300">
        <Text className="text-lg font-bold">HikeMeet</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SearchPage")}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <TouchableOpacity
        onPress={() => navigation.navigate("SearchPage")}
        activeOpacity={0.8}
        className="mx-4 mt-2"
      >
        <View className="flex-row items-center px-4 py-3 bg-gray-200 rounded-lg shadow-sm">
          <Ionicons name="search" size={20} color="gray" style={{ marginRight: 8 }} />
          <TextInput
            editable={false}
            placeholder="Search Everything..."
            className="flex-1 text-gray-700"
          />
        </View>
      </TouchableOpacity>

      {/* Filters */}
      <View className="flex-row justify-around py-2 border-b border-gray-300 mt-4">
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
