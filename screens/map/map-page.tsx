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

import { Trip } from "../../interfaces/trip-interface";
import { Group } from "../../interfaces/group-interface";
import { ActiveFilter } from "./components/header/FiltersBar";
/* Haversine helper */ /// neet to be libery change to import
function distanceMeters(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000; // metres
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
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
  /* ---------- map & location ---------- */
  const cameraRef = useRef<Camera>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  /* ---------- animations ---------- */
  const panelOldAnim = useRef(new Animated.Value(1)).current; // carousel
  const panelNewAnim = useRef(new Animated.Value(0)).current; // popup
  const [popupTrip, setPopupTrip] = useState<Trip | null>(null);

  /* ---------- effects ---------- */
  useEffect(() => {
    fetchAllData({});
    getUserLocation();
  }, []);

  // מיון לפי מרחק כאשר יש גם מיקום וגם רשימה מלאה
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

  // החזרת הקרוסלה כאשר חוזרים למפה ואין פופ‑אפ
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
      if (prev) return prev; // כבר גלוי
      Animated.timing(panelOldAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      return true;
    });
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
      if (!userLocation) setTrips(merged); // fallback עד שיש מיקום
    } catch (e) {
      console.error(e);
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
    if (!resp.ok) throw new Error("Failed to fetch trips");
    const data: Trip[] = await resp.json();
    return data.map((t) => ({ ...t, groups: t.groups || [] }));
  }

  async function fetchGroups(): Promise<Group[]> {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    if (!resp.ok) throw new Error("Failed to fetch groups");
    const raw = await resp.json();
    return raw
      .filter((g: any) => g.status !== "complק")
      .map((g: any) => ({
        ...g,
        membersCount: Array.isArray(g.members) ? g.members.length : 0,
        leaderName: g.created_by?.username || "Unknown",
      }));
  }

  /* ---------- view‑mode toggle ---------- */
  const toggleViewMode = () => {
    if (viewMode === "map") {
      hideCarousel();
      setViewMode("list");
    } else {
      setViewMode("map"); // useEffect יחזיר את הקרוסלה
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
        onRemoveFilter={() => {}}
        onOpenTripFilter={hideCarousel}
        onOpenGroupFilter={hideCarousel}
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
        <TripList trips={trips} navigation={navigation} />
      )}

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
    </View>
  );
}
// --------------------------------------------------
// Other component files remain unchanged.
// ==================================================
