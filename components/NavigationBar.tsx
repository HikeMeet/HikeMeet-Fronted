import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigationHelpers } from "../navigation/navigation";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

export default function NavigationBar() {
  const { navigateToHome, navigateToProfile } = useNavigationHelpers();

  return (
    <View style={tw`absolute bottom-0 left-0 w-full flex-row justify-between items-center bg-white shadow-md p-3`}>
      {/* Profile Icon */}
      <TouchableOpacity onPress={navigateToProfile} style={tw`flex-1 items-center`}>
        <Image
          source={{ uri: "https://via.placeholder.com/40" }}
          style={tw`w-10 h-10 rounded-full`}
        />
        <View style={tw`w-2 h-2 bg-red-500 rounded-full absolute top-1 right-5`}></View>
      </TouchableOpacity>

      {/* Chat Icon */}
      <TouchableOpacity style={tw`flex-1 items-center`}>
        <MaterialIcons name="chat" size={24} color="black" />
      </TouchableOpacity>

      {/* Add Post Icon */}
      <TouchableOpacity style={tw`flex-1 items-center`}>
        <FontAwesome5 name="plus-square" size={24} color="black" />
      </TouchableOpacity>

      {/* Videos Icon */}
      <TouchableOpacity style={tw`flex-1 items-center`}>
        <MaterialIcons name="video-library" size={24} color="black" />
      </TouchableOpacity>

      {/* Explore Icon */}
      <TouchableOpacity style={tw`flex-1 items-center`}>
        <FontAwesome5 name="compass" size={24} color="black" />
      </TouchableOpacity>

      {/* Home Icon */}
      <TouchableOpacity onPress={navigateToHome} style={tw`flex-1 items-center`}>
        <FontAwesome5 name="home" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}
