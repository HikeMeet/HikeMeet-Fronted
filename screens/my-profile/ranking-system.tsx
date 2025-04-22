import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RankInfo } from "../../interfaces/rank-info";

const ranks: Omit<RankInfo, "exp">[] = [
  {
    rankName: "Rookie",
    nextRank: 50,
    rankImageUrl: require("../../assets/ranks/rookie.svg").default,
  },
  {
    rankName: "Adventurer",
    nextRank: 120,
    rankImageUrl: require("../../assets/ranks/adventurer.svg").default,
  },
  {
    rankName: "Veteran",
    nextRank: 220,
    rankImageUrl: require("../../assets/ranks/veteran.svg").default,
  },
  {
    rankName: "Epic",
    nextRank: 340,
    rankImageUrl: require("../../assets/ranks/epic.svg").default,
  },
  {
    rankName: "Elite",
    nextRank: 480,
    rankImageUrl: require("../../assets/ranks/elite.svg").default,
  },
  {
    rankName: "Legend",
    nextRank: Infinity,
    rankImageUrl: require("../../assets/ranks/legend.svg").default,
  },
];

interface RankingSystemProps {
  navigation: any;
}

const RankingSystem: React.FC<RankingSystemProps> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-extrabold text-gray-800">
          Ranking System
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-gray-800 mb-3">
          Progress Through Ranks
        </Text>
        <Text className="text-gray-600 mb-6 leading-relaxed">
          Earn EXP points by participating, contributing and being active.
          Unlock ranks and gain recognition as you grow in the community!
        </Text>

        {ranks.map((rank) => (
          <View
            key={rank.rankName}
            className="bg-gray-50 rounded-2xl p-4 mb-4 flex-row items-center shadow-sm"
          >
            <rank.rankImageUrl width={36} height={36} />
            <View className="ml-4">
              <Text className="text-lg font-semibold text-gray-800">
                {rank.rankName}
              </Text>
              <Text className="text-sm text-gray-500">
                {rank.nextRank === Infinity
                  ? "🏆 Final Rank - You've made it to the top!"
                  : `🎯 Reach ${rank.nextRank} EXP to unlock`}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-8 bg-blue-600 py-3 px-6 rounded-full shadow-md self-center"
        >
          <Text className="text-white font-semibold text-base text-center">
            Got it!
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RankingSystem;
