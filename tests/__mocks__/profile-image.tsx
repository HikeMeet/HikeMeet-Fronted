import React from "react";
import { View, Text } from "react-native";

interface ProfileImageProps {
  initialImage?: string;
  size?: number;
  id?: string;
  uploadType?: string;
  editable?: boolean;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  initialImage,
  size = 60,
  id,
  uploadType,
  editable = false,
}) => {
  return (
    <View testID="profile-image" style={{ width: size, height: size }}>
      <Text testID="profile-image-content">
        {initialImage ? "Profile Image" : "No Image"}
      </Text>
      {editable && <Text testID="editable-indicator">Editable</Text>}
    </View>
  );
};

export default ProfileImage;
