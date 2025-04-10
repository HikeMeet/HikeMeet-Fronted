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
