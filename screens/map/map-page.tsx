import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";
import * as Location from "expo-location";

import CenterOnMeButton from "./components/center-on-me-button";
import TripMarker from "./components/trip-marker";
import TripPopup from "./components/trip-popup";

// -- הקומפוננטות החדשות --
import SearchBar from "./components/SearchBar";
import TripFilterModal from "../../components/TripFilterModal";
import GroupFilterModal from "../../components/GroupFilterModal";
import FiltersBar, { ActiveFilter } from "./components/FiltersBar";

// ייבוא הממשקים מתוך הקבצים החיצוניים
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

  // חלונות סינון
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [showTripFilter, setShowTripFilter] = useState(false);

  // מערך של כל הפילטרים הפעילים (צ'יפים)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // כאן נשמור אילו פילטרים נעביר כ-initial ל-TripFilterModal
  const [tripModalInitialFilters, setTripModalInitialFilters] = useState<{
    location: string;
    tags: string[];
  }>({ location: "", tags: [] });

  const cameraRef = useRef<Camera>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [groupModalInitialFilters, setGroupModalInitialFilters] = useState({
    difficulties: [] as string[],
    statuses: [] as string[],
    maxMembers: "",
    scheduledStart: "",
    scheduledEnd: "",
  });

  useEffect(() => {
    fetchAllData({});
    getUserLocation();
  }, []);

  // -- getUserLocation --
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

  // -- fetchAllData --
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

  // -- fetchTrips --
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

  // -- fetchGroups --
  async function fetchGroups(): Promise<Group[]> {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    if (!resp.ok) throw new Error("Failed to fetch groups");
    const rawData = await resp.json();
    return rawData
      .filter((g: any) => g.status !== "completd")
      .map((g: any) => ({
        ...g,
        membersCount: Array.isArray(g.members) ? g.members.length : 0,
        leaderName: g.created_by?.username || "Unknown",
      }));
  }

  // החלפת מצב מפה/רשימה
  function toggleViewMode() {
    setViewMode((prev) => (prev === "map" ? "list" : "map"));
  }

  // חיפוש עיר
  async function handleSearchCity() {
    await fetchAllData({ city });

    if (city.trim()) {
      setActiveFilters((prev) => [
        ...prev.filter((f) => !f.id.startsWith("city=")),
        { id: `city=${city}`, label: `City: ${city}` },
      ]);
    } else {
      // הסרת צ'יפ של city=...
      setActiveFilters((prev) => prev.filter((f) => !f.id.startsWith("city=")));
    }
  }

  // לחיצה על מרקר
  function onMarkerPress(trip: Trip) {
    setSelectedTrip(trip);
  }

  // Center on user
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

  // הצטרפות לקבוצה
  async function handleJoinGroup(groupId: string) {
    try {
      const resp = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}/join`,
        { method: "POST" }
      );
      if (!resp.ok) throw new Error("Failed to join group");
      Alert.alert("Success", "You have joined this group!");

      // טוען מחדש עם הפילטר city הקיים
      await fetchAllData({ city });
      setSelectedTrip(null);
    } catch (err) {
      console.error("Error joining group:", err);
      Alert.alert("Error", "Could not join group.");
    }
  }

  // --- פתיחת חלון סינון טיולים בצורה מסונכרנת ---
  function openTripFilterModal() {
    // 1) מזהים אם יש tripLocation=xxx
    const locFilter = activeFilters.find((f) =>
      f.id.startsWith("tripLocation=")
    );
    const locationVal = locFilter ? locFilter.id.split("=")[1] : "";

    // 2) מזהים כל tripTag=yyy
    const tagFilters = activeFilters
      .filter((f) => f.id.startsWith("tripTag="))
      .map((f) => f.id.split("=")[1]); // מה שאחרי '='

    // 3) setState
    setTripModalInitialFilters({
      location: locationVal,
      tags: tagFilters,
    });

    // פותחים את המודל
    setShowTripFilter(true);
  }

  // כשלוחצים Apply ב-TripFilterModal
  function onApplyTripFilters(
    filteredTrips: Trip[],
    chosenFilters: { id: string; label: string }[]
  ) {
    setTrips(filteredTrips);

    // ניקוי פילטרים ישנים:
    setActiveFilters((prev) =>
      prev.filter(
        (f) => !f.id.startsWith("tripTag=") && !f.id.startsWith("tripLocation=")
      )
    );
    // והוספה של החדשים
    setActiveFilters((prev) => [...prev, ...chosenFilters]);
  }

  // כשלוחצים Apply ב-GroupFilterModal
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

    // city=..
    if (filterId.startsWith("city=")) {
      setCity("");
      fetchAllData({ city: "" });
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

  function openGroupFilterModal() {
    // 1) מחפשים groupDifficulty=, groupStatus=, groupMaxMembers=, groupStart=, groupEnd=
    const difficultyFilters = activeFilters
      .filter((f) => f.id.startsWith("groupDifficulty="))
      .map((f) => f.id.split("=")[1]); // הערך שאחרי '='

    const statusFilters = activeFilters
      .filter((f) => f.id.startsWith("groupStatus="))
      .map((f) => f.id.split("=")[1]);

    // maxMembers
    const maxMem = activeFilters.find((f) =>
      f.id.startsWith("groupMaxMembers=")
    );
    const maxVal = maxMem ? maxMem.id.split("=")[1] : "";

    // start date
    const startF = activeFilters.find((f) => f.id.startsWith("groupStart="));
    const startVal = startF ? startF.id.split("=")[1] : "";

    // end date
    const endF = activeFilters.find((f) => f.id.startsWith("groupEnd="));
    const endVal = endF ? endF.id.split("=")[1] : "";

    // 2) מעדכן את הסטייט
    setGroupModalInitialFilters({
      difficulties: difficultyFilters,
      statuses: statusFilters,
      maxMembers: maxVal,
      scheduledStart: startVal,
      scheduledEnd: endVal,
    });

    // פותח את המודאל
    setShowGroupFilter(true);
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-3 shadow-sm">
        {/* שורת החיפוש */}
        <View className="flex-row items-center space-x-2">
          <SearchBar
            value={city}
            onChangeText={(val) => setCity(val)}
            onSearch={handleSearchCity}
            placeholder="Search city..."
          />

          <TouchableOpacity
            onPress={toggleViewMode}
            className="bg-green-600 px-3 py-2 rounded"
          >
            <Text className="text-white font-semibold">
              {viewMode === "map" ? "List View" : "Map View"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* סרגל הצ'יפים + כפתורי סינון */}
        <FiltersBar
          filters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          /** לפני פתיחת TripFilter - נאסוף את הפילטרים הקיימים ל-initialFilters */
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
