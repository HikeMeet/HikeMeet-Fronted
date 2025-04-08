import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
  Animated,
} from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";
import * as Location from "expo-location";

import CenterOnMeButton from "./components/center-on-me-button";
import TripMarker from "./components/trip-marker";
import CitySearchBar from "./components/CitySearchBar";
import TripFilterModal from "../../components/TripFilterModal";
import GroupFilterModal from "../../components/GroupFilterModal";
import FiltersBar, { ActiveFilter } from "./components/FiltersBar";

// הפאנל החדש שייפתח עם אנימציה (TripPopup)
import TripPopup from "./components/trip-popup";

import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";

interface TripFilter {
  city?: string;
  category?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [city, setCity] = useState<string>("");

  // --- פילטרים ---
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [showTripFilter, setShowTripFilter] = useState(false);
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

  // מפה
  const cameraRef = useRef<Camera>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  // --- קרוסלה + אינדקס ---
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenHeight = Dimensions.get("window").height;

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

      // משייכים קבוצות לטיולים
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

  // --- מצב תצוגה (Map / List) ---
  function toggleViewMode() {
    setViewMode((prev) => (prev === "map" ? "list" : "map"));
  }

  // --- כפתור "מרכז אותי" ---
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

  function handleSelectCity(coords: [number, number], placeName: string) {
    // מזיזים את המצלמה למיקום המבוקש
    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 13,
      animationDuration: 1000,
    });
    // שומרים בעיר
    setCity(placeName);

    // טוענים דאטה מסויימת
    fetchAllData({ city: placeName });

    // מוסיפים פילטר Active
    setActiveFilters((prev) => [
      ...prev.filter((f) => !f.id.startsWith("city=")),
      { id: `city=${placeName}`, label: `City: ${placeName}` },
    ]);
  }

  // --- גלילה לקרוסלה אחרי לחיצה על מרקר ---
  function onMarkerPress(trip: Trip) {
    const index = trips.findIndex((t) => t._id === trip._id);
    if (index !== -1) {
      scrollToIndex(index);
    }
  }

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (SCREEN_WIDTH * 0.85));
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      const trip = trips[newIndex];
      if (trip?.location?.coordinates) {
        cameraRef.current?.setCamera({
          centerCoordinate: trip.location.coordinates as [number, number],
          zoomLevel: 13,
          animationDuration: 1000,
        });
      }
    }
  }

  function scrollToIndex(idx: number) {
    setCurrentIndex(idx);
    scrollViewRef.current?.scrollTo({
      x: idx * (SCREEN_WIDTH * 0.85),
      y: 0,
      animated: true,
    });
    const trip = trips[idx];
    if (trip?.location?.coordinates) {
      cameraRef.current?.setCamera({
        centerCoordinate: trip.location.coordinates as [number, number],
        zoomLevel: 13,
        animationDuration: 1000,
      });
    }
  }

  // === שני פאנלים: "פאנל ישן" (הקרוסלה) ו"פאנל חדש" (TripPopup) ===
  // הגדרנו אנימציה עבור כל אחד מהם.
  // panelOldAnim: 1 => מוצג למעלה, 0 => מוסתר למטה
  // panelNewAnim: 0 => מוסתר למטה, 1 => מוצג למעלה
  const panelOldAnim = useRef(new Animated.Value(1)).current; // מתחיל גלוי
  const panelNewAnim = useRef(new Animated.Value(0)).current; // מתחיל מוסתר

  const [popupTrip, setPopupTrip] = useState<Trip | null>(null);

  // --- פתיחת הפאנל החדש (TripPopup) עם אנימציית מעבר ---
  function openTripPopup(trip: Trip) {
    // שלב 1: קרוסלה (פאנל ישן) מחליקה למטה (מ-1 ל-0)
    Animated.timing(panelOldAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // אחרי שנסגרה, מעדכנים popupTrip ומראים את הפאנל החדש
      setPopupTrip(trip);

      // שלב 2: TripPopup עולה מלמטה (מ-0 ל-1)
      Animated.timing(panelNewAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }

  // --- סגירת הפאנל החדש וחזרה לקרוסלה (פאנל ישן) ---
  function closeTripPopup() {
    // שלב 1: נוריד את הפאנל החדש למטה (מ-1 ל-0)
    Animated.timing(panelNewAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setPopupTrip(null); // מסירים את ה-TripPopup אחרי שהסתיים

      // שלב 2: מעלים את הקרוסלה חזרה (מ-0 ל-1)
      Animated.timing(panelOldAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }
  // פאנל ישן (קרוסלה)
  // panelOldAnim = 1 => למעלה (translateY=0), panelOldAnim = 0 => למטה (translateY=700)
  const oldPanelTranslateY = panelOldAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [700, 0],
  });

  // פאנל חדש (TripPopup)
  // panelNewAnim = 0 => למטה (translateY=700), panelNewAnim = 1 => למעלה (translateY=0)
  const newPanelTranslateY = panelNewAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  // --- TripFilter ---
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
    scrollToIndex(0);
  }

  // --- GroupFilter ---
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
  function onApplyGroupFilters(
    filteredGroups: Group[],
    chosenFilters: { id: string; label: string }[]
  ) {
    setGroups(filteredGroups);
    setActiveFilters((prev) => prev.filter((f) => !f.id.startsWith("group")));
    setActiveFilters((prev) => [...prev, ...chosenFilters]);
  }

  // --- הסרת פילטר ---
  function handleRemoveFilter(filterId: string) {
    const newFilters = activeFilters.filter((f) => f.id !== filterId);
    setActiveFilters(newFilters);

    if (filterId.startsWith("city=")) {
      setCity("");
      if (userLocation) {
        cameraRef.current?.setCamera({
          centerCoordinate: userLocation,
          zoomLevel: 13,
          animationDuration: 1000,
        });
      }
      fetchAllData({});
      scrollToIndex(0);
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
    scrollToIndex(0);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-white p-3 shadow-sm">
        <View
          className="flex-row items-center space-x-2"
          style={{ zIndex: 9999 }}
        >
          <View className="flex-1">
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
                scrollToIndex(0);
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
          {/* כפתור "מרכז אותי" */}
          <CenterOnMeButton onPress={handleCenterOnMe} />

          {/* מפה */}
          <Mapbox.MapView className="flex-1" styleURL={Mapbox.StyleURL.Street}>
            <Camera
              ref={cameraRef}
              zoomLevel={13}
              pitch={0}
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

            {/* מרקרים */}
            {trips.map((trip) => {
              const [lon, lat] = trip.location.coordinates;
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
                  onPressMarker={() => onMarkerPress(trip)}
                />
              );
            })}
          </Mapbox.MapView>

          {/* Animated.View של "הפאנל הישן" (הקרוסלה) */}
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              transform: [{ translateY: oldPanelTranslateY }],
            }}
          >
            {/* === כאן קרוסלת הכרטיסים === */}
            {trips.length > 0 && (
              <View className="pb-3">
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={SCREEN_WIDTH * 0.85 + 10}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleScrollEnd}
                  contentContainerStyle={{
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                >
                  {trips.map((trip) => {
                    const activeGroupsCount =
                      trip.groups?.filter((g) => g.status === "planned")
                        .length || 0;

                    return (
                      <View
                        key={trip._id}
                        className="bg-white rounded-3xl shadow-xl p-4 mx-2"
                        style={{
                          width: SCREEN_WIDTH * 0.85,
                        }}
                      >
                        <Text className="text-base font-bold text-gray-900 mb-1">
                          {trip.name}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {trip.location.address}
                        </Text>

                        {/* תמונה ריבועית */}
                        {trip.main_image?.url && (
                          <Image
                            source={{ uri: trip.main_image.url }}
                            className="w-full h-70 rounded-md mt-3"
                            resizeMode="cover"
                          />
                        )}

                        <Text className="text-xs mt-2 text-gray-600">
                          {activeGroupsCount} active groups
                        </Text>

                        {/* כפתור לפתיחת TripPopup (פאנל חדש) */}
                        <TouchableOpacity
                          onPress={() => openTripPopup(trip)}
                          className="bg-emerald-600 rounded-md py-2 px-4 mt-3"
                        >
                          <Text className="text-white text-center font-semibold">
                            View Trip Details
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </>
      ) : (
        // ==== מצב רשימה (List View) ====
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
                  onPress={() =>
                    navigation.navigate("TripsStack", {
                      screen: "TripPage",
                      params: { tripId: trip._id },
                    })
                  }
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

      {/* Animated.View של "הפאנל החדש" (TripPopup) */}
      {popupTrip && (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            marginTop: 10,
            transform: [{ translateY: newPanelTranslateY }],
          }}
        >
          <TripPopup
            trip={popupTrip}
            onClose={closeTripPopup}
            navigation={navigation}
            onGroupPress={(groupId, action) => {}}
            onAddGroup={() => {
              navigation.navigate("GroupsStack", {
                screen: "CreateGroupPage",
                params: { trip: popupTrip },
              });
            }}
          />
        </Animated.View>
      )}

      {/* Group Filter Modal */}
      <GroupFilterModal
        visible={showGroupFilter}
        onClose={() => setShowGroupFilter(false)}
        groups={allGroups}
        onApply={(filteredGroups, chosenFilters) => {
          onApplyGroupFilters(filteredGroups, chosenFilters);
        }}
        initialFilters={groupModalInitialFilters}
      />

      {/* Trip Filter Modal */}
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
