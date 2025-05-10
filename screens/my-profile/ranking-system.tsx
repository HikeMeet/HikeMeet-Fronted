import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRankIcon, getNextRankThreshold } from "./components/rank-images";

const rankNames = ["Rookie", "Adventurer", "Veteran", "Epic", "Elite", "Legend"] as const;

const ranks = rankNames.map((rankName) => ({
  rankName,
  nextRank: getNextRankThreshold(rankName),
  rankImage: getRankIcon(rankName),
}));

const expRules = [
  { category: "Groups", action: "Create a group", points: "+10" },
  { category: "Groups", action: "Join a group (Public/Private)", points: "+5" },
  { category: "Groups", action: "Leave a group (voluntarily)", points: "-5" },
  { category: "Groups", action: "Delete a group", points: "-10" },
  { category: "Trips", action: "Create a trip", points: "+10" },
  { category: "Trips", action: "Delete a trip", points: "-10" },
  { category: "Posts", action: "Create a post", points: "+8" },
  {
    category: "Posts",
    action: "Share a post",
    points: "+10 (sharer) / +5 (original author)",
  },
  { category: "Posts", action: "Receive a like on a post", points: "+5" },
  { category: "Posts", action: "Unlike a post", points: "-5" },
  { category: "Posts", action: "Get a save on a post", points: "+3" },
  { category: "Posts", action: "Unsave a post", points: "-3" },
  { category: "Comments", action: "Add a comment", points: "+4" },
  { category: "Comments", action: "Delete your comment", points: "-4" },
  { category: "Comments", action: "Receive a like on a comment", points: "+2" },
  { category: "Comments", action: "Unlike a comment", points: "-2" },
  {
    category: "Friends",
    action: "Become friends (accept friend request)",
    points: "+5 each",
  },
  { category: "Friends", action: "Remove a friend", points: "-5 each" },
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
      <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        <Text className="text-2xl font-bold text-gray-800 mb-3">
          Progress Through Ranks
        </Text>
        <Text className="text-gray-600 mb-6 leading-relaxed">
          Earn EXP points by participating, contributing, and being active.
          Unlock ranks and gain recognition as you grow in the community!
        </Text>

        {/* Ranks Display */}
        {ranks.map((rank) => (
          <View
            key={rank.rankName}
            className="bg-gray-50 rounded-2xl p-2 mb-4 flex-row items-center shadow-sm"
          >
            {rank.rankImage && <rank.rankImage width={36} height={36} />}
            <View className="ml-4">
              <Text className="text-lg font-semibold text-gray-800">
                {rank.rankName}
              </Text>
              <Text className="text-sm text-gray-500">
                {rank.nextRank === null
                  ? "🏆 Final Rank - You've made it to the top!"
                  : `🎯 Reach ${rank.nextRank} EXP to unlock`}
              </Text>
            </View>
          </View>
        ))}

        {/* How to Earn EXP Section */}
        <View className="mt-8">
          <Text className="text-2xl font-bold text-gray-800 mb-3">
            How to Earn EXP
          </Text>
          {expRules.map((rule, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center bg-gray-100 rounded-lg p-3 mb-2"
            >
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700">
                  {rule.category}
                </Text>
                <Text className="text-xs text-gray-600">{rule.action}</Text>
              </View>
              <Text className="text-sm font-bold text-blue-600">
                {rule.points}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-10 bg-blue-600 py-3 px-6 rounded-full shadow-md self-center"
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
