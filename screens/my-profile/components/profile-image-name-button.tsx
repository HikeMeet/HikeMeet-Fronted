import React from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import { useAuth } from "../../../contexts/auth-context";

interface ProfileHeaderLinkProps {
  userId: string;
  username: string;
  profileImage: string; // URL of the user's profile image
  navigation: any;
}

const ProfileHeaderLink: React.FC<ProfileHeaderLinkProps> = ({
  userId,
  username,
  profileImage,
  navigation,
}) => {
  const { mongoId } = useAuth();

  const handlePress = () => {
    if (userId === mongoId) {
      navigation.push("Tabs", { screen: "Profile" });
    } else {
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId },
      });
    }
  };

  return (
    <View className="flex-row items-center p-2">
      <TouchableOpacity onPress={handlePress}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-300" />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePress} className="ml-2">
        <Text className="font-bold text-base text-gray-900">{username}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeaderLink;
