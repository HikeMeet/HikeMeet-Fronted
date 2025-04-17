import { useState, useCallback } from "react";
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Group } from "../interfaces/group-interface";
import InviteFriendsModal from "./invite-list-in-group-modal";
import MembersModal from "./membes-list-in-group-modal";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/auth-context";

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
  const { mongoId } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setShowMembersModal(false);
      setShowInviteModal(false);
    }, [])
  );

  const showInviteCondition = () => {
    if (isAdmin) return true;
    else
      return (
        group.privacy === "public" &&
        group.members.some((member) => member.user === mongoId)
      );
  };
  // Calculate if the group is full.
  const isFull =
    group.members.length + group.pending.length >= group.max_members;

  return (
    <View>
      {/* Main "Hikers" Toggle Buttons */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => setShowMembersModal(true)}
          className="flex-1 bg-blue-500 px-4 py-2 rounded mt-4 mx-1"
        >
          <Text className="text-white text-sm font-semibold text-center">
            View Members
          </Text>
        </TouchableOpacity>
        {showInviteCondition() && (
          <TouchableOpacity
            onPress={() => {
              if (!isFull) {
                setShowInviteModal(true);
              }
            }}
            disabled={isFull}
            className={`flex-1 px-4 py-2 rounded mt-4 mx-1 ${
              isFull ? "bg-gray-500" : "bg-purple-500"
            }`}
          >
            <Text className="text-white text-sm font-semibold text-center">
              {isFull ? "Group is full" : "Invite Friends"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showMembersModal && (
        <MembersModal
          visible={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          isAdmin={isAdmin}
          navigation={navigation}
          groupId={group._id}
        />
      )}
      {showInviteModal && (
        <InviteFriendsModal
          visible={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          navigation={navigation}
          groupId={group._id}
        />
      )}
    </View>
  );
};

export default React.memo(HikersSwitcher);
