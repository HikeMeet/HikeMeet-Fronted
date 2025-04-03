import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";
import * as Location from "expo-location";

import CenterOnMeButton from "./components/center-on-me-button";
import TripMarker from "./components/trip-marker";
import TripPopup from "./components/trip-popup";
import CitySearchBar from "./components/CitySearchBar"; //new

import TripFilterModal from "../../components/TripFilterModal";
import GroupFilterModal from "../../components/GroupFilterModal";
import FiltersBar, { ActiveFilter } from "./components/FiltersBar";

import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";

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
  const [city, setCity] = useState<string>("");

  // סינון
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [showTripFilter, setShowTripFilter] = useState(false);

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // initial filters
  const [tripModalInitialFilters, setTripModalInitialFilters] = useState({
    location: "",
    tags: [] as string[],
  });
  const [groupModalInitialFilters, setGroupModalInitialFilters] = useState({
    difficulties: [] as string[],
    statuses: [] as string[],
    maxMembers: "",
    scheduledStart: "",
    scheduledEnd: "",
  });

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
      setUserLocation([location.coords.longitude, location.coords.latitude]);
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

      setAllTrips(mergedTrips);
      setAllGroups(groupsResp);

      setTrips(mergedTrips);
      setGroups(groupsResp);
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
    console.log("trip", resp);

    if (!resp.ok) throw new Error("Failed to fetch trips");
    const data: Trip[] = await resp.json();
    return data.map((t) => ({ ...t, groups: t.groups || [] }));
  }

  async function fetchGroups(): Promise<Group[]> {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    if (!resp.ok) throw new Error("Failed to fetch groups");
    const rawData = await resp.json();
    console.log("group", rawData);
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

  // בוחר עיר מה- CitySearchBar
  function handleSelectCity(coords: [number, number], placeName: string) {
    // מזיזים את המצלמה
    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 13,
      animationDuration: 1000,
    });
    // שומרים ב-state
    setCity(placeName);
    // טוענים דאטה
    fetchAllData({ city: placeName });
    // מוסיפים צ'יפ
    setActiveFilters((prev) => [
      // מוחקים קודם city= קודמת
      ...prev.filter((f) => !f.id.startsWith("city=")),
      { id: `city=${placeName}`, label: `City: ${placeName}` },
    ]);
  }

  // כשלוחצים על מרקר
  function onMarkerPress(trip: Trip) {
    setSelectedTrip(trip);
  }

  // פתיחת TripFilter
  function openTripFilterModal() {
    const locFilter = activeFilters.find((f) =>
      f.id.startsWith("tripLocation=")
    );
    const locationVal = locFilter ? locFilter.id.split("=")[1] : "";

    const tagFilters = activeFilters
      .filter((f) => f.id.startsWith("tripTag="))
      .map((f) => f.id.split("=")[1]);

    setTripModalInitialFilters({ location: locationVal, tags: tagFilters });
    setShowTripFilter(true);
  }

  // Apply TripFilter
  function onApplyTripFilters(
    filteredTrips: Trip[],
    chosenFilters: { id: string; label: string }[]
  ) {
    setTrips(filteredTrips);
    setActiveFilters((prev) =>
      prev.filter(
        (f) => !f.id.startsWith("tripTag=") && !f.id.startsWith("tripLocation=")
      )
    );
    setActiveFilters((prev) => [...prev, ...chosenFilters]);
  }

  // פתיחת GroupFilter
  function openGroupFilterModal() {
    const difficultyFilters = activeFilters
      .filter((f) => f.id.startsWith("groupDifficulty="))
      .map((f) => f.id.split("=")[1]);

    const statusFilters = activeFilters
      .filter((f) => f.id.startsWith("groupStatus="))
      .map((f) => f.id.split("=")[1]);

    const maxMem = activeFilters.find((f) =>
      f.id.startsWith("groupMaxMembers=")
    );
    const maxVal = maxMem ? maxMem.id.split("=")[1] : "";

    const startF = activeFilters.find((f) => f.id.startsWith("groupStart="));
    const startVal = startF ? startF.id.split("=")[1] : "";

    const endF = activeFilters.find((f) => f.id.startsWith("groupEnd="));
    const endVal = endF ? endF.id.split("=")[1] : "";

    setGroupModalInitialFilters({
      difficulties: difficultyFilters,
      statuses: statusFilters,
      maxMembers: maxVal,
      scheduledStart: startVal,
      scheduledEnd: endVal,
    });
    setShowGroupFilter(true);
  }

  // Apply GroupFilter
  function onApplyGroupFilters(
    filteredGroups: Group[],
    chosenFilters: { id: string; label: string }[]
  ) {
    setGroups(filteredGroups);
    setActiveFilters((prev) => prev.filter((f) => !f.id.startsWith("group")));
    setActiveFilters((prev) => [...prev, ...chosenFilters]);
  }

  // הסרת פילטר
  function handleRemoveFilter(filterId: string) {
    const newFilters = activeFilters.filter((f) => f.id !== filterId);
    setActiveFilters(newFilters);

    if (filterId.startsWith("city=")) {
      // חזרנו למיקום הנוכחי
      setCity("");
      if (userLocation) {
        cameraRef.current?.setCamera({
          centerCoordinate: userLocation,
          zoomLevel: 13,
          animationDuration: 1000,
        });
      }
      fetchAllData({});
      return;
    }

    let filteredTrips = [...allTrips];
    let filteredGroups = [...allGroups];

    newFilters.forEach((filter) => {
      if (filter.id.startsWith("tripTag=")) {
        const tagVal = filter.id.split("=")[1];
        filteredTrips = filteredTrips.filter((t) => {
          const tTags = (t as any).tags || [];
          return tTags.includes(tagVal);
        });
      }
      if (filter.id.startsWith("tripLocation=")) {
        const locVal = filter.id.split("=")[1];
        filteredTrips = filteredTrips.filter((t) =>
          t.location.address.toLowerCase().includes(locVal.toLowerCase())
        );
      }
      if (filter.id.startsWith("groupStatus=")) {
        const statusVal = filter.id.split("=")[1];
        filteredGroups = filteredGroups.filter((g) =>
          g.status?.toLowerCase().includes(statusVal.toLowerCase())
        );
      }
    });

    setTrips(filteredTrips);
    setGroups(filteredGroups);
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-3 shadow-sm">
        {/* שורת החיפוש */}
        <View
          className="flex-row items-center space-x-2"
          style={{ zIndex: 9999 }}
        >
          <View className="flex-1">
            {/* CitySearchBar עם onClearLocation */}
            <CitySearchBar
              placeholder="Search city..."
              onSelectLocation={handleSelectCity}
              onClearLocation={() => {
                // המשתמש מחק לגמרי => חוזרים למיקום המשתמש
                setCity("");
                if (userLocation) {
                  cameraRef.current?.setCamera({
                    centerCoordinate: userLocation,
                    zoomLevel: 13,
                    animationDuration: 1000,
                  });
                }
                // מסירים פילטר city= אם קיים
                setActiveFilters((prev) =>
                  prev.filter((f) => !f.id.startsWith("city="))
                );
                // טוענים מחדש בלי city
                fetchAllData({});
              }}
            />
          </View>

          <TouchableOpacity
            onPress={toggleViewMode}
            className="bg-green-600 px-3 py-2 rounded"
          >
            <Text className="text-white font-semibold">
              {viewMode === "map" ? "List View" : "Map View"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* סרגל הצ'יפים + כפתורי Filter */}
        <FiltersBar
          filters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onOpenTripFilter={openTripFilterModal}
          onOpenGroupFilter={openGroupFilterModal}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0D9488" className="mt-10" />
      ) : viewMode === "map" ? (
        <>
          <CenterOnMeButton onPress={handleCenterOnMe} />
          <Mapbox.MapView
            className="flex-1"
            styleURL={Mapbox.StyleURL.Street}
            onRegionWillChange={() => selectedTrip && setSelectedTrip(null)}
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

              // Instead of g.membersCount, simply use g.members.length
              const hasAvailability = trip.groups?.some(
                (g) => g.members.length < g.max_members
              );
              return (
                <TripMarker
                  key={trip._id}
                  trip={trip}
                  longitude={lon}
                  latitude={lat}
                  hasAvailability={hasAvailability}
                  onPressMarker={() => setSelectedTrip(trip)}
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
          onGroupPress={(groupId, action) => {}}
          onAddGroup={() => {
            navigation.navigate("GroupsStack", {
              screen: "CreateGroupPage",
              params: { trip: selectedTrip },
            });
          }}
        />
      )}

      {/* מודאל סינון קבוצות */}
      <GroupFilterModal
        visible={showGroupFilter}
        onClose={() => setShowGroupFilter(false)}
        groups={allGroups}
        onApply={(filteredGroups, chosenFilters) => {
          onApplyGroupFilters(filteredGroups, chosenFilters);
        }}
        initialFilters={groupModalInitialFilters}
      />
      {/* מודאל סינון טיולים */}
      <TripFilterModal
        visible={showTripFilter}
        onClose={() => setShowTripFilter(false)}
        trips={allTrips}
        onApply={(filteredTrips, chosenFilters) => {
          onApplyTripFilters(filteredTrips, chosenFilters);
        }}
        initialFilters={tripModalInitialFilters}
      />
    </View>
  );
}
