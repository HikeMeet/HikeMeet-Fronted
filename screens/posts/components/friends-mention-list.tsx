// FriendMentionList.tsx
import React from "react";
import { View, ScrollView, TouchableOpacity, Image, Text } from "react-native";
import { Friend } from "../../../interfaces/user-interface";

interface FriendMentionListProps {
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
}

const FriendMentionList: React.FC<FriendMentionListProps> = ({
  friends,
  onSelectFriend,
}) => {
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
