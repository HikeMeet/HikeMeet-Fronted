// screens/map/map-page.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import * as Location from "expo-location";
import { Camera } from "@rnmapbox/maps";

import MapHeader from "./components/header/MapHeader";
import { MapContainer } from "./components/map/MapContainer";
import TripCarousel from "./components/carousel/TripCarousel";
import TripPopup from "./components/popup/trip-popup";
import TripList from "./components/list/TripList";
import TripFilterModal from "../../components/TripFilterModal";
import GroupFilterModal from "../../components/GroupFilterModal";

import { Trip } from "../../interfaces/trip-interface";
import { Group } from "../../interfaces/group-interface";
import { ActiveFilter } from "./components/header/FiltersBar";

/* Haversine helper */
function distanceMeters(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const φ1 = toRad(lat1),
    φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
type TripFilter = { city?: string; category?: string };
type MapPageProps = { navigation: any; route: any };

export default function MapPage({ navigation }: MapPageProps) {
  /* ---------- state ---------- */
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [city, setCity] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [carouselVisible, setCarouselVisible] = useState(true);

  /* filter‑modal state */
  const [showTripFilter, setShowTripFilter] = useState(false);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
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

  /* ---------- map & location ---------- */
  const cameraRef = useRef<Camera>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  /* ---------- animations ---------- */
  const panelOldAnim = useRef(new Animated.Value(1)).current;
  const panelNewAnim = useRef(new Animated.Value(0)).current;
  const [popupTrip, setPopupTrip] = useState<Trip | null>(null);

  const controlsDisabled =
    popupTrip !== null || showTripFilter || showGroupFilter;

  /* ---------- effects ---------- */
  useEffect(() => {
    fetchAllData({});
    getUserLocation();
  }, []);

  useEffect(() => {
    if (!userLocation || !allTrips.length) return;
    const sorted = [...allTrips].sort((a, b) => {
      const dA = distanceMeters(
        a.location.coordinates as [number, number],
        userLocation
      );
      const dB = distanceMeters(
        b.location.coordinates as [number, number],
        userLocation
      );
      return dA - dB;
    });
    setTrips(sorted);
  }, [userLocation, allTrips]);

  useEffect(() => {
    if (viewMode === "map" && !popupTrip) showCarousel();
  }, [viewMode, popupTrip]);

  /* ---------- helpers ---------- */
  function hideCarousel() {
    if (!carouselVisible) return;
    Animated.timing(panelOldAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setCarouselVisible(false));
  }
  function showCarousel() {
    setCarouselVisible((prev) => {
      if (prev) return prev;
      Animated.timing(panelOldAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      return true;
    });
  }

  /** עזר – בונה trips עם groups מסוננות */
  function rebuildTripsWithGroups(baseTrips: Trip[], filteredGroups: Group[]) {
    const byTrip: Record<string, Group[]> = {};
    filteredGroups.forEach((g) => {
      if (!byTrip[g.trip]) byTrip[g.trip] = [];
      byTrip[g.trip].push(g);
    });
    return baseTrips.map((tr) => ({
      ...tr,
      groups: byTrip[tr._id] || [],
    }));
  }

  /** החלת כל הפילטרים הפעילים */
  function applyAllFilters(filters: ActiveFilter[]) {
    let t = [...allTrips];
    let g = [...allGroups];

    filters.forEach((f) => {
      /* ---------- TRIP filters ---------- */
      if (f.id.startsWith("tripTag=")) {
        const tag = f.id.split("=")[1];
        t = t.filter((tr) => (tr as any).tags?.includes(tag));
      }
      if (f.id.startsWith("tripLocation=")) {
        const loc = f.id.split("=")[1].toLowerCase();
        t = t.filter((tr) => tr.location.address.toLowerCase().includes(loc));
      }

      /* ---------- GROUP filters ---------- */
      if (f.id.startsWith("groupStatus=")) {
        const status = f.id.split("=")[1].toLowerCase();
        g = g.filter((gr) => gr.status?.toLowerCase() === status);
      }
      if (f.id.startsWith("groupDifficulty=")) {
        const diff = f.id.split("=")[1];
        g = g.filter((gr: any) => gr.difficulty === diff);
      }
      if (f.id.startsWith("groupMaxMembers=")) {
        const max = parseInt(f.id.split("=")[1], 10);
        if (!isNaN(max)) g = g.filter((gr) => gr.max_members <= max);
      }
      if (f.id.startsWith("groupStart=")) {
        const start = f.id.split("=")[1];
        g = g.filter(
          (gr: any) => gr.scheduled_start && gr.scheduled_start >= start
        );
      }
      if (f.id.startsWith("groupEnd=")) {
        const end = f.id.split("=")[1];
        g = g.filter((gr: any) => gr.scheduled_end && gr.scheduled_end <= end);
      }
    });

    /* עדכן state */
    setGroups(g);
    setTrips(rebuildTripsWithGroups(t, g));
  }

  /* ---------- location ---------- */
  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation([loc.coords.longitude, loc.coords.latitude]);
    } catch (err) {
      console.error("Failed to get user location", err);
    }
  }

  /* ---------- data fetch ---------- */
  async function fetchAllData(filter: TripFilter) {
    setLoading(true);
    try {
      const [tripsResp, groupsResp] = await Promise.all([
        fetchTrips(filter),
        fetchGroups(),
      ]);
      const groupsByTrip: Record<string, Group[]> = {};
      groupsResp.forEach((g) => {
        if (!groupsByTrip[g.trip]) groupsByTrip[g.trip] = [];
        groupsByTrip[g.trip].push(g);
      });
      const merged = tripsResp.map((t) => ({
        ...t,
        groups: groupsByTrip[t._id] || [],
      }));
      setAllTrips(merged);
      setAllGroups(groupsResp);
      setGroups(groupsResp);
      if (!userLocation) setTrips(merged);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrips(filter: TripFilter): Promise<Trip[]> {
    let url = `${process.env.EXPO_LOCAL_SERVER}/api/trips/all`;
    const params = new URLSearchParams();
    if (filter.city?.trim()) params.append("city", filter.city.trim());
    if (filter.category?.trim())
      params.append("category", filter.category.trim());
    if (params.toString()) url += `?${params.toString()}`;
    const resp = await fetch(url);
    const data: Trip[] = await resp.json();
    return data.map((t) => ({ ...t, groups: t.groups || [] }));
  }
  async function fetchGroups(): Promise<Group[]> {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    const raw = await resp.json();
    return raw
      .filter((g: any) => g.status !== "compl")
      .map((g: any) => ({
        ...g,
        membersCount: Array.isArray(g.members) ? g.members.length : 0,
        leaderName: g.created_by?.username || "Unknown",
      }));
  }

  /* ---------- filter‑modal handlers ---------- */
  function openTripFilterModal() {
    hideCarousel();
    const locFilter = activeFilters.find((f) =>
      f.id.startsWith("tripLocation=")
    );
    const tagFilters = activeFilters
      .filter((f) => f.id.startsWith("tripTag="))
      .map((f) => f.id.split("=")[1]);

    setTripModalInitialFilters({
      location: locFilter ? locFilter.id.split("=")[1] : "",
      tags: tagFilters,
    });
    setShowTripFilter(true);
  }

  function openGroupFilterModal() {
    hideCarousel();

    const difficulties = activeFilters
      .filter((f) => f.id.startsWith("groupDifficulty="))
      .map((f) => f.id.split("=")[1]);
    const statuses = activeFilters
      .filter((f) => f.id.startsWith("groupStatus="))
      .map((f) => f.id.split("=")[1]);
    const maxMem = activeFilters.find((f) =>
      f.id.startsWith("groupMaxMembers=")
    );
    const startF = activeFilters.find((f) => f.id.startsWith("groupStart="));
    const endF = activeFilters.find((f) => f.id.startsWith("groupEnd="));

    setGroupModalInitialFilters({
      difficulties,
      statuses,
      maxMembers: maxMem ? maxMem.id.split("=")[1] : "",
      scheduledStart: startF ? startF.id.split("=")[1] : "",
      scheduledEnd: endF ? endF.id.split("=")[1] : "",
    });
    setShowGroupFilter(true);
  }

  function onApplyTripFilters(filteredTrips: Trip[], chosen: ActiveFilter[]) {
    setTrips(filteredTrips);
    setActiveFilters((prev) => [
      ...prev.filter(
        (f) => !f.id.startsWith("tripTag=") && !f.id.startsWith("tripLocation=")
      ),
      ...chosen,
    ]);
    setShowTripFilter(false);
    if (viewMode === "map") showCarousel();
  }

  function onApplyGroupFilters(
    filteredGroups: Group[],
    chosen: ActiveFilter[]
  ) {
    setGroups(filteredGroups);

    setActiveFilters((prev) => [
      ...prev.filter((f) => !f.id.startsWith("group")),
      ...chosen,
    ]);

    // עדכון trips בהתאם
    setTrips(rebuildTripsWithGroups(allTrips, filteredGroups));

    setShowGroupFilter(false);
    if (viewMode === "map") showCarousel();
  }

  function handleRemoveFilter(filterId: string) {
    const newFilters = activeFilters.filter((f) => f.id !== filterId);
    setActiveFilters(newFilters);
    applyAllFilters(newFilters);

    if (filterId.startsWith("city=")) {
      setCity("");
      if (viewMode === "map" && userLocation) {
        cameraRef.current?.setCamera({
          centerCoordinate: userLocation,
          zoomLevel: 13,
          animationDuration: 1000,
        });
      }
    }
  }

  /* ---------- view‑mode toggle ---------- */
  const toggleViewMode = () => {
    if (viewMode === "map") {
      hideCarousel();
      setViewMode("list");
    } else {
      setViewMode("map");
    }
  };

  /* ---------- center‑on‑me ---------- */
  function handleCenterOnMe() {
    Location.getCurrentPositionAsync({}).then((loc) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
        zoomLevel: 13,
        animationDuration: 1000,
      });
    });
  }

  /* ---------- city select ---------- */
  function handleSelectCity(coords: [number, number], placeName: string) {
    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 16,
      animationDuration: 1000,
    });
    setCity(placeName);
    fetchAllData({ city: placeName });
    setActiveFilters((prev) => [
      ...prev.filter((f) => !f.id.startsWith("city=")),
      { id: `city=${placeName}`, label: `City: ${placeName}` },
    ]);
    hideCarousel();
  }

  /* ---------- popup open / close ---------- */
  const oldPanelTranslateY = panelOldAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [700, 0],
  });
  const newPanelTranslateY = panelNewAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  function openTripPopup(trip: Trip) {
    hideCarousel();
    Animated.timing(panelOldAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setPopupTrip(trip);
      Animated.timing(panelNewAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }
  function closeTripPopup() {
    Animated.timing(panelNewAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setPopupTrip(null);
      if (viewMode === "map") showCarousel();
    });
  }

  /* ---------- carousel scroll sync ---------- */
  const [currentIndex, setCurrentIndex] = useState(0);
  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIdx = Math.round(offsetX / (SCREEN_WIDTH * 0.85));
    if (newIdx !== currentIndex) {
      setCurrentIndex(newIdx);
      const trip = trips[newIdx];
      if (trip?.location?.coordinates) {
        cameraRef.current?.setCamera({
          centerCoordinate: trip.location.coordinates as [number, number],
          zoomLevel: 16,
          animationDuration: 1000,
        });
      }
    }
  }

  /* ---------- render ---------- */
  return (
    <View className="flex-1 bg-gray-50">
      <MapHeader
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onOpenTripFilter={openTripFilterModal}
        onOpenGroupFilter={openGroupFilterModal}
        onSelectCity={handleSelectCity}
        onClearCity={() => {
          setCity("");
          fetchAllData({});
          if (viewMode === "map") showCarousel();
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0D9488" className="mt-10" />
      ) : viewMode === "map" ? (
        <>
          <MapContainer
            cameraRef={cameraRef}
            trips={trips}
            userLocation={userLocation}
            onCenterOnMe={handleCenterOnMe}
            onMarkerPress={openTripPopup}
            disableControls={controlsDisabled}
          />

          {carouselVisible && trips.length > 0 && (
            <Animated.View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                transform: [{ translateY: oldPanelTranslateY }],
              }}
            >
              <TripCarousel
                trips={trips}
                onOpenPopup={openTripPopup}
                onScrollEnd={handleScrollEnd}
              />
            </Animated.View>
          )}
        </>
      ) : (
        <TripList
          trips={trips}
          onOpenTrip={openTripPopup}
          onScrollStart={() => {
            if (popupTrip) closeTripPopup(); // סגור אם פתוח
          }}
        />
      )}

      {/* Popup */}
      {popupTrip && (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateY: newPanelTranslateY }],
          }}
        >
          <TripPopup
            trip={popupTrip}
            onClose={closeTripPopup}
            navigation={navigation}
            onGroupPress={() => {}}
            onAddGroup={() =>
              navigation.navigate("GroupsStack", {
                screen: "CreateGroupPage",
                params: { trip: popupTrip },
              })
            }
          />
        </Animated.View>
      )}

      {/* Groups Filter Modal */}
      <GroupFilterModal
        visible={showGroupFilter}
        onClose={() => {
          setShowGroupFilter(false);
          if (viewMode === "map" && !popupTrip) showCarousel();
        }}
        groups={allGroups}
        onApply={onApplyGroupFilters}
        initialFilters={groupModalInitialFilters}
      />

      {/* Trip Filter Modal */}
      <TripFilterModal
        visible={showTripFilter}
        onClose={() => {
          setShowTripFilter(false);
          if (viewMode === "map" && !popupTrip) showCarousel();
        }}
        trips={allTrips}
        onApply={onApplyTripFilters}
        initialFilters={tripModalInitialFilters}
      />
    </View>
  );
}
