import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";

export interface GroupTrip {
  group: Group;
  trip?: Trip;
}

export const fetchGroupDetails = async (
  groupId: string,
  getTrip: boolean = false
): Promise<GroupTrip> => {
  const url = `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}${
    getTrip ? "?getTrip=true" : ""
  }`;
  const response = await fetch(url);
  if (!response.ok) {
    console.log("Failed to fetch group details");
  }
  return await response.json();
};

export const fetchUsersData = async (ids: string[]): Promise<any[]> => {
  try {
    const idsString = ids.join(",");
    const res = await fetch(
      `${process.env.EXPO_LOCAL_SERVER}/api/user/list-by-ids?ids=${idsString}`
    );
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (error) {
    console.error("Error fetching users data:", error);
    throw error;
  }
};
