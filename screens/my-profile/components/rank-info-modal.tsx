import React from "react";
import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
import { getRankIcon, getNextRankThreshold } from "./rank-images";

interface Props {
  visible: boolean;
  rankName: string;
  exp: number;
  onClose: () => void;
  isMyProfile: boolean;
}

const RankInfoModal: React.FC<Props> = ({
  visible,
  rankName,
  exp,
  onClose,
  isMyProfile,
}) => {
  const RankIcon = getRankIcon(rankName);
  const nextRank = getNextRankThreshold(rankName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 justify-center items-center bg-black/20"
      >
        <Pressable
          onPress={() => {}}
          className="bg-white rounded-2xl w-11/12 max-w-md p-6 items-center shadow-lg"
          style={{
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          {/* Title with Icon */}
          <View className="flex-row items-center mb-1 space-x-2">
            <Text className="text-xl font-extrabold text-gray-800">
              {rankName}
            </Text>
            {RankIcon && <RankIcon width={28} height={28} />}
          </View>

          {/* EXP Display */}
          <Text className="text-gray-500 mb-2 text-sm">
            Total EXP: <Text className="font-semibold">{exp}</Text>
          </Text>

          {/* EXP to next rank */}
{isMyProfile && (
  typeof nextRank === "number" && nextRank !== Infinity ? (
    <Text className="text-gray-600 text-sm text-center">
      You need{" "}
      <Text className="font-bold">{nextRank - exp}</Text>{" "}
      more EXP to reach the next rank!
    </Text>
  ) : (
    <Text className="text-green-600 font-medium text-sm text-center">
      You reached the highest rank! 🎉
    </Text>
  )
)}

          {/* Close Button */}
          <TouchableOpacity
            className="mt-5 bg-blue-600 px-6 py-2 rounded-full"
            onPress={onClose}
          >
            <Text className="text-white font-bold text-sm">Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RankInfoModal;
