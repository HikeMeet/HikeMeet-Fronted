import React from "react";
import { View, ScrollView, TouchableOpacity, Image, Text } from "react-native";
import { Friend } from "../../../interfaces/user-interface";

interface FriendMentionListProps {
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
  mentionQuery: string; // the text typed after the "@" symbol
}

const FriendMentionList: React.FC<FriendMentionListProps> = ({
  friends,
  onSelectFriend,
  mentionQuery,
}) => {
  // If there are no suggestions:
  if (friends.length === 0) {
    // If the query is one character or empty, display "No friends"
    if (mentionQuery.length <= 1) {
      return (
        <View style={{ minHeight: 5, justifyContent: "center" }}>
          <Text className="text-center sm:text-sm text-gray-500">
            No friends
          </Text>
        </View>
      );
    } else {
      // If the user has typed more than one character and there are still no suggestions,
      // hide the suggestion container.
      return null;
    }
  }

  // If there are friend suggestions available, render them.
  return (
    <View className="bg-white py-2 mt-1 border border-gray-300 rounded-md">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {friends.map((friend) =>
          friend.data ? (
            <TouchableOpacity
              key={friend.id}
              onPress={() => onSelectFriend(friend)}
              className="flex-row items-center mr-4"
            >
              <Image
                source={{ uri: friend.data.profile_picture.url }}
                className="w-8 h-8 rounded-full mr-2"
              />
              <Text className="text-base">{friend.data.username}</Text>
            </TouchableOpacity>
          ) : null
        )}
      </ScrollView>
    </View>
  );
};

export default FriendMentionList;
