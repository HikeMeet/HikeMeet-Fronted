export interface Group {
  _id: string;
  name: string;
  trip: string;
  max_members: number;
  membersCount: number;
  leaderName: string;
}

export interface Trip {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  groups?: Group[];
}
