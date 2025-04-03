// MapPage.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal, // אפשר להשאיר אם אתה באמת משתמש ב-Modal (או להוריד אם עברנו לקומפוננטה גמישה)
} from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";
import * as Location from "expo-location";

// קומפוננטות שעברו לקבצים נפרדים
import SearchBar from "./components/SearchBar";
import TripFilterModal from "../../components/TripFilterModal";
import GroupFilterModal from "../../components/GroupFilterModal";

// קומפוננטות שלך
import CenterOnMeButton from "./components/center-on-me-button";
import TripMarker from "./components/trip-marker";
import TripPopup from "./components/trip-popup";

// הממשקים של Trip ו-Group
export interface Group {
  _id: string;
  name: string;
  trip: string;
  max_members: number;
  membersCount: number;
  leaderName: string;
  status?: string;
  created_by?: any;
  members?: any[];
  pending?: any[];
  privacy?: string;
}

export interface Trip {
  _id: string;
  name: string;
  description?: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  main_image?: {
    url: string;
    [key: string]: any;
  };
  images?: Array<{ url: string; [key: string]: any }>;
  groups?: Group[];
}

interface TripFilter {
  city?: string;
  category?: string;
}

type MapPageProps = {
  navigation: any;
  route: any;
};

export default function MapPage({ navigation }: MapPageProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // State לחיפוש
  const [city, setCity] = useState<string>("");

  // חלונות פופאפ/מודאל לסינון
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [showTripFilter, setShowTripFilter] = useState(false);

  // מצלמה/מיקום
  const cameraRef = useRef<Camera>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    fetchAllData({});
    getUserLocation();
  }, []);

  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];
      setUserLocation(coords);
    } catch (err) {
      console.error("Failed to get user location:", err);
    }
  }

  async function fetchAllData(filter: TripFilter) {
    setLoading(true);
    try {
      const [tripsResp, groupsResp] = await Promise.all([
        fetchTrips(filter),
        fetchGroups(),
      ]);

      const groupsByTrip: { [key: string]: Group[] } = {};
      groupsResp.forEach((group) => {
        if (!groupsByTrip[group.trip]) groupsByTrip[group.trip] = [];
        groupsByTrip[group.trip].push(group);
      });

      const mergedTrips = tripsResp.map((trip) => ({
        ...trip,
        groups: groupsByTrip[trip._id] || [],
      }));

      setTrips(mergedTrips);
      setAllTrips(mergedTrips);
      setGroups(groupsResp);
      setAllGroups(groupsResp);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrips(filter: TripFilter): Promise<Trip[]> {
    let url = `${process.env.EXPO_LOCAL_SERVER}/api/trips/all`;
    const params = new URLSearchParams();
    if (filter.city && filter.city.trim())
      params.append("city", filter.city.trim());
    if (filter.category && filter.category.trim())
      params.append("category", filter.category.trim());
    if (params.toString()) url += `?${params.toString()}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Failed to fetch trips");
    const data: Trip[] = await resp.json();
    return data.map((t) => ({ ...t, groups: t.groups || [] }));
  }

  async function fetchGroups(): Promise<Group[]> {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    if (!resp.ok) throw new Error("Failed to fetch groups");
    const rawData = await resp.json();
    return rawData
      .filter((g: any) => g.status !== "completed")
      .map((g: any) => ({
        ...g,
        membersCount: Array.isArray(g.members) ? g.members.length : 0,
        leaderName: g.created_by?.username || "Unknown",
      }));
  }

  function toggleViewMode() {
    setViewMode((prev) => (prev === "map" ? "list" : "map"));
  }

  async function handleSearchCity() {
    // ביצוע fetchAllData לפי ה-city
    await fetchAllData({ city });
  }

  function onMarkerPress(trip: Trip) {
    setSelectedTrip(trip);
  }

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

  async function handleJoinGroup(groupId: string) {
    try {
      const resp = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}/join`,
        {
          method: "POST",
        }
      );
      if (!resp.ok) throw new Error("Failed to join group");
      Alert.alert("Success", "You have joined this group!");
      // מרעננים את הדאטה עם הפילטרים הקיימים (למשל city, ...)
      await fetchAllData({ city });
      setSelectedTrip(null);
    } catch (err) {
      console.error("Error joining group:", err);
      Alert.alert("Error", "Could not join group.");
    }
  }

  // פונקציה שתופעל ברגע שמשתמש לוחץ Apply ב-TripFilterModal
  const onApplyTripFilter = (filteredTrips: Trip[]) => {
    setTrips(filteredTrips);
    // אפשר להסתיר את המודאל
    setShowTripFilter(false);
  };

  // פונקציה שתופעל כשמשתמש לוחץ Apply ב-GroupFilterModal
  const onApplyGroupFilter = (filteredGroups: Group[]) => {
    setGroups(filteredGroups);
    setShowGroupFilter(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* אזור החיפוש והכפתורים */}
      <View className="bg-white p-3 shadow-sm">
        <View className="flex-row items-center space-x-2">
          {/* SearchBar */}
          <SearchBar
            value={city}
            onChangeText={(val) => setCity(val)}
            onSearch={handleSearchCity}
            placeholder="Search city..."
          />
          {/* מעבר בין Map / List */}
          <TouchableOpacity
            onPress={toggleViewMode}
            className="bg-green-600 px-3 py-2 rounded"
          >
            <Text className="text-white font-semibold">
              {viewMode === "map" ? "List View" : "Map View"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* כפתורי פתיחת סינון */}
        <View className="flex-row mt-2 space-x-2">
          <TouchableOpacity
            onPress={() => setShowGroupFilter(true)}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            <Text className="text-sm text-gray-800 font-semibold">
              Filter Groups
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTripFilter(true)}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            <Text className="text-sm text-gray-800 font-semibold">
              Filter Trips
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0D9488" className="mt-10" />
      ) : viewMode === "map" ? (
        <>
          <CenterOnMeButton onPress={handleCenterOnMe} />
          <Mapbox.MapView
            className="flex-1"
            styleURL={Mapbox.StyleURL.Street}
            onRegionWillChange={() => {
              if (selectedTrip) setSelectedTrip(null);
            }}
          >
            <Camera
              ref={cameraRef}
              zoomLevel={15}
              pitch={60}
              centerCoordinate={userLocation || [34.7818, 32.0853]}
            />
            <Mapbox.VectorSource
              id="composite"
              url="mapbox://mapbox.mapbox-streets-v8"
            >
              <Mapbox.FillExtrusionLayer
                id="3d-buildings"
                sourceLayerID="building"
                style={{
                  fillExtrusionColor: "#aaa",
                  fillExtrusionHeight: ["get", "height"],
                  fillExtrusionBase: ["get", "min_height"],
                  fillExtrusionOpacity: 0.6,
                }}
                filter={["==", "extrude", "true"]}
                minZoomLevel={15}
                maxZoomLevel={22}
              />
            </Mapbox.VectorSource>
            {trips.map((trip) => {
              const [lon, lat] = trip.location.coordinates;
              const hasAvailability = trip.groups?.some(
                (g) => g.membersCount < g.max_members
              );
              return (
                <TripMarker
                  key={trip._id}
                  trip={trip}
                  longitude={lon}
                  latitude={lat}
                  hasAvailability={hasAvailability}
                  onPressMarker={onMarkerPress}
                />
              );
            })}
          </Mapbox.MapView>
        </>
      ) : (
        <ScrollView className="flex-1 p-3">
          {trips.length === 0 ? (
            <Text className="text-center text-gray-500 mt-4">
              No trips found.
            </Text>
          ) : (
            trips.map((trip) => {
              const activeGroups =
                trip.groups?.filter((g) => g.status === "planned").length || 0;
              return (
                <TouchableOpacity
                  key={trip._id}
                  onPress={() => setSelectedTrip(trip)}
                  className="flex-row bg-white rounded-lg shadow mb-3 p-4"
                >
                  {trip.main_image?.url && (
                    <Image
                      source={{ uri: trip.main_image.url }}
                      className="w-16 h-16 mr-3 rounded"
                      resizeMode="cover"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                      {trip.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {trip.location.address}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {activeGroups} active group(s)
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Trip Popup */}
      {selectedTrip && (
        <TripPopup
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          navigation={navigation}
          onGroupPress={(groupId, action) => {
            if (action === "join") {
              handleJoinGroup(groupId);
            } else {
              navigation.navigate("GroupsStack", {
                screen: "GroupPage",
                params: { groupId },
              });
            }
          }}
          onAddGroup={() => {
            navigation.navigate("GroupsStack", {
              screen: "CreateGroupPage",
              params: {
                trip: selectedTrip,
              },
            });
          }}
        />
      )}

      {/* מודאל סינון קבוצות */}
      <GroupFilterModal
        visible={showGroupFilter}
        onClose={() => setShowGroupFilter(false)}
        groups={allGroups}
        onApply={onApplyGroupFilter}
      />

      {/* מודאל סינון טיולים */}
      <TripFilterModal
        visible={showTripFilter}
        onClose={() => setShowTripFilter(false)}
        trips={allTrips}
        onApply={onApplyTripFilter}
      />
    </View>
  );
}
