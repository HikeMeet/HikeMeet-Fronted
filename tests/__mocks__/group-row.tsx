import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

const GroupRow = ({
  group,
  onPress,
  navigation,
  showJoinButton = true,
  isMember = false,
  onJoinPress,
}: any) => {
  return (
    <TouchableOpacity
      testID={`group-row-${group.id || group._id}`}
      onPress={() => onPress && onPress(group)}
      style={{
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          testID={`group-name-${group.id || group._id}`}
          style={{ fontSize: 16, fontWeight: "bold" }}
        >
          {group.name || "Unknown Group"}
        </Text>
        {group.description && (
          <Text
            testID={`group-description-${group.id || group._id}`}
            style={{ fontSize: 14, color: "#666" }}
          >
            {group.description}
          </Text>
        )}
        {group.members_count !== undefined && (
          <Text
            testID={`group-members-${group.id || group._id}`}
            style={{ fontSize: 12, color: "#888" }}
          >
            {group.members_count} members
          </Text>
        )}
      </View>
      {showJoinButton && (
        <TouchableOpacity
          testID={`join-button-${group.id || group._id}`}
          onPress={() => onJoinPress && onJoinPress(group)}
          style={{
            backgroundColor: isMember ? "#e0e0e0" : "#28a745",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: isMember ? "#333" : "#fff" }}>
            {isMember ? "Joined" : "Join"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default GroupRow;
