import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import InviteFriendsModal from "./search-friend-to-invite";
import { Group } from "../interfaces/group-interface";

interface GroupCreatedModalProps {
  visible: boolean;
  onOk: () => void;
  group: Group | null;
  navigation: any;
}

const GroupCreatedModal: React.FC<GroupCreatedModalProps> = ({
  visible,
  navigation,
  onOk,
  group,
}) => {
  const [inviteVisible, setInviteVisible] = useState(false);

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={onOk}
      >
        <View
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
        >
          <View style={tw`bg-white rounded-lg p-6 w-11/12`}>
            <Text style={tw`text-xl font-bold text-center mb-4`}>
              Group created successfully!
            </Text>
            <Text style={tw`text-lg text-center mb-4`}>
              Would you like to invite your friends?
            </Text>
            <View style={tw`flex-row justify-around mb-4`}>
              <TouchableOpacity
                onPress={() => setInviteVisible(true)}
                style={tw`bg-purple-500 rounded px-4 py-2`}
              >
                <Text style={tw`text-white text-sm font-semibold`}>
                  Invite Friends
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onOk}
                style={tw`bg-blue-500 rounded px-4 py-2`}
              >
                <Text style={tw`text-white text-sm font-semibold`}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* InviteFriendsModal is rendered separately when inviteVisible is true */}
      {inviteVisible && group && (
        <InviteFriendsModal
          visible={inviteVisible}
          onClose={() => setInviteVisible(false)}
          group={group}
          navigation={navigation}
        />
      )}
    </>
  );
};

export default GroupCreatedModal;
