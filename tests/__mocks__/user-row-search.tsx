import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

const UserRow = ({
  user,
  onPress,
  navigation,
  showFollowButton = true,
  isFollowing = false,
  onFollowPress,
}: any) => {
  return (
    <TouchableOpacity
      testID={`user-row-${user.id || user._id}`}
      onPress={() => onPress && onPress(user)}
      style={{
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          testID={`user-name-${user.id || user._id}`}
          style={{ fontSize: 16, fontWeight: "bold" }}
        >
          {user.name || user.username || "Unknown User"}
        </Text>
        {user.bio && (
          <Text
            testID={`user-bio-${user.id || user._id}`}
            style={{ fontSize: 14, color: "#666" }}
          >
            {user.bio}
          </Text>
        )}
      </View>
      {showFollowButton && (
        <TouchableOpacity
          testID={`follow-button-${user.id || user._id}`}
          onPress={() => onFollowPress && onFollowPress(user)}
          style={{
            backgroundColor: isFollowing ? "#e0e0e0" : "#007bff",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: isFollowing ? "#333" : "#fff" }}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default UserRow;
