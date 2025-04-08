import { Group } from "../../interfaces/group-interface";

export const fetchGroups = async (): Promise<Group[]> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_LOCAL_SERVER}/api/group/list`
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
