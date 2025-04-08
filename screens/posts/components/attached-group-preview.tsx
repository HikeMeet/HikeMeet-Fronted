import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import GroupRow from "../../groups/components/group-row";
import { Group } from "../../../interfaces/group-interface";

interface SelectedGroupsListProps {
  groups: Group[];
  navigation: any;
  onRemove?: (groupId: string) => void;
}

const SelectedGroupsList: React.FC<SelectedGroupsListProps> = ({
  groups,
  navigation,
  onRemove,
}) => {
  if (groups.length === 0) return null;
  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-2">Attached Groups:</Text>
      {groups.map((group) => (
        <View
          key={group._id}
          style={{ paddingRight: 16 }} // Adjust or add padding as needed.
          className="flex-row items-center"
        >
          <GroupRow
            group={group}
            navigation={navigation}
            onPress={() => {
              navigation.navigate("GroupsStack", {
                screen: "GroupPage",
                params: { groupId: group._id },
              });
            }}
          />
          {onRemove && (
            <TouchableOpacity onPress={() => onRemove(group._id)}>
              <Icon
                name="close"
                size={20}
                color="red"
                style={{ marginLeft: 8 }} // Add margin to the left of the button.
              />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

export default SelectedGroupsList;
