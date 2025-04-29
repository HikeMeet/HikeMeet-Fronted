export const fetchGroups = async (query: string) => {
  const res = await fetch(
    `${process.env.EXPO_LOCAL_SERVER}/api/search/groups?query=${query}`
  );
  const { groups = [] } = await res.json();
  return groups;
};

export const fetchTrips = async (query: string) => {
  const res = await fetch(
    `${process.env.EXPO_LOCAL_SERVER}/api/search/trips?query=${query}`
  );
  const { trips = [] } = await res.json();
  return trips;
};

export const fetchUsers = async (query: string) => {
  const res = await fetch(
    `${process.env.EXPO_LOCAL_SERVER}/api/search/users?query=${query}`
  );
  const { friends = [] } = await res.json();
  return friends;
};

export const fetchAll = async (query: string) => {
  const res = await fetch(
    `${process.env.EXPO_LOCAL_SERVER}/api/search/all?query=${query}`
  );
  const { friends = [], trips = [], groups = [] } = await res.json();
  return { friends, trips, groups };
};
