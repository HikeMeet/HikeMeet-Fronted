import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";
import * as Location from "expo-location";
import CenterOnMeButton from "./components/CenterOnMeButton";
import TripMarker from "./components/TripMarker";
import TripPopup from "./components/TripPopup";

// ממשק Group
export interface Group {
  _id: string;
  name: string;
  trip: string; // מזהה הטיול אליו היא שייכת
  max_members: number;
  membersCount: number;
  leaderName: string;
}

// ממשק Trip
export interface Trip {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  groups?: Group[]; // נוסיף את הקבוצות המתאימות
}

type MapPageProps = {
  navigation: any;
  route: any;
};

export default function MapPage({ navigation }: MapPageProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  /** פונקציית עזר שמושכת את כל הנתונים (טיולים וקבוצות) ואז ממזגת אותם */
  async function fetchAllData() {
    setLoading(true);
    try {
      await fetchTrips();
      await fetchGroups();
      mergeTripsAndGroups(); // בסוף שני השליפות
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  /** שליפת הטיולים */
  async function fetchTrips() {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/trips/all`);
    if (!resp.ok) {
      throw new Error("Failed to fetch trips");
    }
    const data: Trip[] = await resp.json();
    // אם השרת לא מחזיר groups, נוודא שלפחות יהיה groups: []
    const fixedTrips = data.map((t) => ({
      ...t,
      groups: t.groups || [],
    }));
    setTrips(fixedTrips);
  }

  /** שליפת כל הקבוצות */
  async function fetchGroups() {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    if (!resp.ok) {
      throw new Error("Failed to fetch groups");
    }
    const data: Group[] = await resp.json();
    setGroups(data);
  }

  /** ממזג את הקבוצות (groups) לתוך הטיולים (trips) לפי tripId */
  function mergeTripsAndGroups() {
    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        // סינון הקבוצות ששייכות לטיול הזה
        const relevantGroups = groups.filter((g) => g.trip === trip._id);
        return {
          ...trip,
          groups: relevantGroups,
        };
      })
    );
  }

  /** בדיקה אם טיול כלשהו מכיל קבוצה פנויה */
  function hasAvailability(trip: Trip) {
    return trip.groups?.some((g) => g.membersCount < g.max_members) ?? false;
  }

  /** לחיצה על מרקר => בוחרים את הטיול (פותח popup) */
  function onMarkerPress(trip: Trip) {
    setSelectedTrip(trip);
  }

  /** ממקדים את המפה למשתמש */
  async function handleCenterOnMe() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      cameraRef.current?.setCamera({
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
        zoomLevel: 13,
        animationDuration: 1000,
      });
    } catch (err) {
      console.error("Error centering on user location:", err);
      Alert.alert("Error", "Could not center on your location.");
    }
  }

  return (
    <View className="flex-1 bg-gray-100">
      {loading ? (
        <ActivityIndicator size="large" className="mt-12" color="#0D9488" />
      ) : (
        <>
          <CenterOnMeButton onPress={handleCenterOnMe} />

          <Mapbox.MapView className="flex-1">
            <Camera
              ref={cameraRef}
              zoomLevel={5}
              centerCoordinate={[34.8516, 31.0461]}
            />

            {trips.map((trip) => {
              const [lon, lat] = trip.location.coordinates;
              return (
                <TripMarker
                  key={trip._id}
                  trip={trip}
                  longitude={lon}
                  latitude={lat}
                  hasAvailability={hasAvailability(trip)}
                  onPressMarker={onMarkerPress}
                />
              );
            })}
          </Mapbox.MapView>
        </>
      )}

      {selectedTrip && (
        <TripPopup
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onGroupPress={(groupId) =>
            navigation.navigate("GroupsStack", {
              screen: "GroupPage",
              params: { groupId },
            })
          }
          onAddGroup={() => {
            navigation.navigate("GroupsStack", {
              screen: "CreateGroupPage",
              params: {
                preSelectedTrip: selectedTrip._id,
                preSelectedTripName: selectedTrip.name,
              },
            });
          }}
        />
      )}
    </View>
  );
}
