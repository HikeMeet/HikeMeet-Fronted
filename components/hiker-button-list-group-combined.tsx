import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Group } from "../interfaces/group-interface";
import InviteFriendsModal from "./search-friend-to-invite";
import MembersModal from "./membes-list-in-group-modal";

interface HikersSwitcherProps {
  navigation: any;
  isAdmin: boolean;
  group: Group;
}

const HikersSwitcher: React.FC<HikersSwitcherProps> = ({
  group,
  navigation,
  isAdmin,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Generic function to fetch user data given an array of IDs.

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
        />
      )}
      {showInviteModal && (
        <InviteFriendsModal
          visible={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          group={group}
          navigation={navigation}
        />
      )}
    </View>
  );
};

export default HikersSwitcher;
