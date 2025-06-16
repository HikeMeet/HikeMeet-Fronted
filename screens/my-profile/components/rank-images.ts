const images = {
  Rookie: require("../../../assets/ranks/rookie.svg").default,
  Adventurer: require("../../../assets/ranks/adventurer.svg").default,
  Veteran: require("../../../assets/ranks/veteran.svg").default,
  Epic: require("../../../assets/ranks/epic.svg").default,
  Elite: require("../../../assets/ranks/elite.svg").default,
  Legend: require("../../../assets/ranks/legend.svg").default,
} as const;

type RankName = keyof typeof images;

export function getRankIcon(rank: string): React.FC<React.SVGProps<SVGSVGElement>> | null {
  if ((rank as RankName) in images) {
    return images[rank as RankName];
  }
  return null;
}


export function getNextRankThreshold(rank: string): number | null {
  switch (rank) {
    case "Rookie":
      return 50;
    case "Adventurer":
      return 120;
    case "Veteran":
      return 220;
    case "Epic":
      return 340;
    case "Elite":
      return 480;
    case "Legend":
      return null;
    default:
      return null;
  }
}
