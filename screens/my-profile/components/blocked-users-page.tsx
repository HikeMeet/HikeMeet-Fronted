import React from "react";
import { View, Text, FlatList } from "react-native";
import { useAuth } from "../../../contexts/auth-context";
import UserRow from "../../../components/user-row-search";

const BlockedUsersPage = ({ navigation }: { navigation: any }) => {
  const { mongoUser } = useAuth();

  const blockedUsers = mongoUser?.friends
    ?.filter((f) => f.status === "blocked" && f.data)
    .map((f) => f.data);

  return (
    <View className="flex-1 bg-white p-4">
      <FlatList
        data={blockedUsers}
        keyExtractor={(user) => user?._id ?? ""}
        renderItem={({ item }) => (
          <UserRow
            user={item}
            navigation={navigation}
            onStatusChange={() => {}}
          />
        )}
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-500 mt-10">
            No blocked users found.
          </Text>
        )}
      />
    </View>
  );
};

export default BlockedUsersPage;
