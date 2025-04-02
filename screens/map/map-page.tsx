// MapPage.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";
import * as Location from "expo-location";

import CenterOnMeButton from "./components/center-on-me-button";
import TripMarker from "./components/trip-marker";
import TripPopup from "./components/trip-popup";
import GroupFilterPopup from "../../components/group-filter-popup";
import TripFilterPopup from "../../components/trip-filter-popup";

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
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [city, setCity] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [showTripFilter, setShowTripFilter] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    fetchAllData({});
    getUserLocation(); // הוסף את זה
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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrips(filter: TripFilter): Promise<Trip[]> {
    let url = `${process.env.EXPO_LOCAL_SERVER}/api/trips/all`;
    const params = new URLSearchParams();
    if (filter.city && filter.city.trim()) {
      params.append("city", filter.city.trim());
    }
    if (filter.category && filter.category.trim()) {
      params.append("category", filter.category.trim());
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Failed to fetch trips");
    const data: Trip[] = await resp.json();
    return data.map((t) => ({ ...t, groups: t.groups || [] }));
  }

  async function fetchGroups(): Promise<Group[]> {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    if (!resp.ok) throw new Error("Failed to fetch groups");
    const rawData = await resp.json();

    const filtered = rawData
      .filter((g: any) => g.status !== "completd")
      .map((g: any) => ({
        ...g,
        membersCount: Array.isArray(g.members) ? g.members.length : 0,
        leaderName: g.created_by?.username || "Unknown",
      }));

    setGroups(filtered);
    return filtered;
  }

  function toggleViewMode() {
    setViewMode((prev) => (prev === "map" ? "list" : "map"));
  }

  async function handleSearchCity() {
    await fetchAllData({ city, category: categoryFilter });
  }

  async function handleCategorySelect(cat: string) {
    setCategoryFilter(cat);
    await fetchAllData({ city, category: cat });
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
        { method: "POST" }
      );
      if (!resp.ok) throw new Error("Failed to join group");
      Alert.alert("Success", "You have joined this group!");
      await fetchAllData({ city, category: categoryFilter });
      setSelectedTrip(null);
    } catch (err) {
      console.error("Error joining group:", err);
      Alert.alert("Error", "Could not join group.");
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-3 shadow-sm">
        <View className="flex-row items-center space-x-2">
          <TextInput
            placeholder="Search city..."
            value={city}
            onChangeText={setCity}
            className="flex-1 bg-gray-200 px-3 py-2 rounded"
          />
          <TouchableOpacity
            onPress={handleSearchCity}
            className="bg-blue-600 px-3 py-2 rounded"
          >
            <Text className="text-white font-semibold">Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleViewMode}
            className="bg-green-600 px-3 py-2 rounded"
          >
            <Text className="text-white font-semibold">
              {viewMode === "map" ? "List View" : "Map View"}
            </Text>
          </TouchableOpacity>
        </View>
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

      <Modal visible={showGroupFilter} transparent animationType="slide">
        <GroupFilterPopup onClose={() => setShowGroupFilter(false)} />
      </Modal>

      <Modal visible={showTripFilter} transparent animationType="slide">
        <TripFilterPopup onClose={() => setShowTripFilter(false)} />
      </Modal>
    </View>
  );
}
