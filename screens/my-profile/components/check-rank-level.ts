import { RankInfo } from "../../../interfaces/rank-info";

const images = {
  Rookie: require("../../../assets/ranks/rookie.svg").default,
  Adventurer: require("../../../assets/ranks/adventurer.svg").default,
  Veteran: require("../../../assets/ranks/veteran.svg").default,
  Epic: require("../../../assets/ranks/epic.svg").default,
  Elite: require("../../../assets/ranks/elite.svg").default,
  Legend: require("../../../assets/ranks/legend.svg").default,
};

export function checkRankLevel(exp: number): RankInfo {
  if (exp >= 0 && exp < 50) {
    return {
      rankName: "Rookie",
      exp,
      nextRank: 50,
      rankImageUrl: images.Rookie,
    };
  }
  if (exp >= 50 && exp < 120) {
    return {
      rankName: "Adventurer",
      exp,
      nextRank: 120,
      rankImageUrl: images.Adventurer,
    };
  }
  if (exp >= 120 && exp < 220) {
    return {
      rankName: "Veteran",
      exp,
      nextRank: 220,
      rankImageUrl: images.Veteran,
    };
  }
  if (exp >= 220 && exp < 340) {
    return {
      rankName: "Epic",
      exp,
      nextRank: 340,
      rankImageUrl: images.Epic,
    };
  }
  if (exp >= 340 && exp < 480) {
    return {
      rankName: "Elite",
      exp,
      nextRank: 480,
      rankImageUrl: images.Elite,
    };
  }

  return {
    rankName: "Legend",
    exp,
    nextRank: Infinity,
    rankImageUrl: images.Legend,
  };
}
