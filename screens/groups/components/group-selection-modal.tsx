import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Group } from "../../../interfaces/group-interface";
import GroupRow from "./group-row";

interface GroupSelectionModalProps {
  visible: boolean;
  groups: Group[];
  navigation: any;
  onSelect: (group: Group) => void;
  onClose: () => void;
}

const GroupSelectionModal: React.FC<GroupSelectionModalProps> = ({
  visible,
  groups,
  onSelect,
  navigation,
  onClose,
}) => {
  const [searchText, setSearchText] = useState("");

  // Filter groups based on search text.
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-white p-4">
        <Text className="text-xl font-bold mb-4">Select a Group</Text>
        <TextInput
          placeholder="Search groups..."
          value={searchText}
          onChangeText={setSearchText}
          className="border border-gray-300 rounded p-2 mb-4"
        />
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              activeOpacity={0.8}
              className="mb-2"
            >
              <GroupRow
                onPress={() => onSelect(item)}
                group={item}
                navigation={navigation}
              />
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          onPress={onClose}
          className="mt-4 p-3 bg-gray-300 rounded items-center"
        >
          <Text className="text-gray-700">Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default GroupSelectionModal;
