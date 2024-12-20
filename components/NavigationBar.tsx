import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigationHelpers } from ".././navigation/navigation";

export default function NavigationBar() {
  const { navigateToHome, navigateToProfile } = useNavigationHelpers();

  return (
    <View style={tw`flex-row justify-between items-center bg-white shadow-md p-3`}>
      <TouchableOpacity onPress={navigateToHome} style={tw`flex-1 items-center`}>
        <Text style={tw`text-blue-500`}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={navigateToProfile} style={tw`flex-1 items-center`}>
        <Text style={tw`text-blue-500`}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
