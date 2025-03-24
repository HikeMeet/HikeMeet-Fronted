import React, { useCallback, useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Group } from "../interfaces/group-interface";
import InviteFriendsModal from "./invite-list-in-group-modal";
import MembersModal from "./membes-list-in-group-modal";
import { useFocusEffect } from "@react-navigation/native";

interface HikersSwitcherProps {
  navigation: any;
  isAdmin: boolean;
  group: Group;
  onRefreshGroup: any;
}

const HikersSwitcher: React.FC<HikersSwitcherProps> = ({
  group,
  navigation,
  isAdmin,
  onRefreshGroup,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setShowMembersModal(false);
      setShowInviteModal(false);
    }, [])
  );
  return (
    <View>
      {/* Main "Hikers" Toggle Button */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => setShowMembersModal(true)}
          className="flex-1 bg-blue-500 px-4 py-2 rounded mt-4 mx-1"
        >
          <Text className="text-white text-sm font-semibold text-center">
            View Members
          </Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => setShowInviteModal(true)}
            className="flex-1 bg-purple-500 px-4 py-2 rounded mt-4 mx-1"
          >
            <Text className="text-white text-sm font-semibold text-center">
              Invite Friends
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showMembersModal && (
        <MembersModal
          visible={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          members={group.members}
          pending={group.pending || []}
          group={group}
          isAdmin={isAdmin}
          navigation={navigation}
          onRefreshGroup={onRefreshGroup}
        />
      )}
      {showInviteModal && (
        <InviteFriendsModal
          visible={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          group={group}
          navigation={navigation}
          onRefreshGroup={onRefreshGroup}
        />
      )}
    </View>
  );
};

export default React.memo(HikersSwitcher);
