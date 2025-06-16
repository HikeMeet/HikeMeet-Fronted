import { Trip } from "../../interfaces/trip-interface";

export const fetchTrips = async (): Promise<Trip[]> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_LOCAL_SERVER}/api/trips/all`
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

export async function fetchTripsByIds(ids: string[]): Promise<Trip[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const idsString = ids.join(",");
  const response = await fetch(
    `${process.env.EXPO_LOCAL_SERVER}/api/trips/list-by-ids?ids=${encodeURIComponent(idsString)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch trips by IDs: ${response.status}`);
  }

  const data: Trip[] = await response.json();
  return data;
}
