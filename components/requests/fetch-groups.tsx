import { Group } from "../../interfaces/group-interface";

export const fetchGroups = async (): Promise<Group[]> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_LOCAL_SERVER}/api/group/list?getArchived=false`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch trips");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw error;
  }
};

export async function fetchUserGroups(userId: string): Promise<Group[]> {
  const res = await fetch(
    `${process.env.EXPO_LOCAL_SERVER}/api/group/user/${userId}`
  );
  if (!res.ok) {
    throw new Error("Failed to load groups");
  }
  const data = await res.json();
  return data.groups as Group[];
}
