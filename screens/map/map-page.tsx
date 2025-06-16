import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";

// Components
import MapHeader from "./components/header/map-header";
import MapContent from "./components/map-content";
import CitySearchBar from "./components/header/city-search-bar";
import TripPopup from "./components/popup/trip-popup";
import NoLocationFallback from "./fallback/no-location-fallback";
import TripFilterModal from "../../components/trip-filter-modal";
import GroupFilterModal from "../../components/group-filter-modal";

// Hooks
import { useLocationManager } from "./hooks/useLocationManager";
import { useFilterManager } from "./hooks/useFilterManager";

// Types & Utils
import { Trip } from "../../interfaces/trip-interface";
import { Group } from "../../interfaces/group-interface";
import {
  Coordinate,
  ViewMode,
  ActiveFilter,
} from "../../interfaces/map-interface";
import { distanceMeters } from "../../utils/geo";
import { theme } from "../../utils/theme";

// Dynamic Mapbox imports
let Mapbox: any = null;
let Camera: any = null;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
  Camera = require("@rnmapbox/maps").Camera;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface MapScreenProps {
  navigation: any;
  route: any;
}

export default function MapPage({ navigation, route }: MapScreenProps) {
  // Location management
  const location = useLocationManager();

  // Filter management
  const filters = useFilterManager();

  // State
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [cityQuery, setCityQuery] = useState("");
  const [carouselVisible, setCarouselVisible] = useState(true);
  const [showTripFilter, setShowTripFilter] = useState(false);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [popupTrip, setPopupTrip] = useState<Trip | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [shouldCloseSearch, setShouldCloseSearch] = useState(false);
  const [pendingAddTripLocation, setPendingAddTripLocation] = useState<
    [number, number] | null
  >(null);
  // שמירה על מרכז המפה במעבר בין map <-> list
  const [lastMapCenter, setLastMapCenter] = useState<Coordinate | null>(null);

  // Animation refs
  const cameraRef = useRef<any>(null);
  const popupAnim = useRef(new Animated.Value(0)).current;

  // Disable controls when modals are open
  const controlsDisabled =
    popupTrip !== null || showTripFilter || showGroupFilter;

  // Fetch data whenever this screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchAllData();
    });

    return unsubscribe;
  }, [navigation]);

  // Sort trips by distance when center changes
  useEffect(() => {
    if (!allTrips.length) return;

    const sortedTrips = sortTripsByDistance(allTrips, location.currentCenter);
    setTrips(sortedTrips);

    // Reset carousel to first item when center changes
    setCurrentIndex(0);
  }, [location.currentCenter, allTrips]);

  // Apply filters when they change
  useEffect(() => {
    const filteredTrips = filters.filterTrips(allTrips);
    const filteredGroups = filters.filterGroups(allGroups);

    // Rebuild trips with filtered groups
    const tripsWithGroups = rebuildTripsWithGroups(
      filteredTrips,
      filteredGroups
    );
    const sortedTrips = sortTripsByDistance(
      tripsWithGroups,
      location.currentCenter
    );

    setTrips(sortedTrips);
    setGroups(filteredGroups);
  }, [filters.activeFilters, allTrips, allGroups, location.currentCenter]);

  // Show carousel when returning to map view
  useEffect(() => {
    if (viewMode === "map" && !popupTrip) {
      setCarouselVisible(true);
    }
  }, [viewMode, popupTrip]);

  // Helper functions
  function sortTripsByDistance(
    tripsToSort: Trip[],
    center: Coordinate
  ): Trip[] {
    return [...tripsToSort].sort((a, b) => {
      const dA = distanceMeters(
        a.location.coordinates as [number, number],
        center
      );
      const dB = distanceMeters(
        b.location.coordinates as [number, number],
        center
      );
      return dA - dB;
    });
  }

  function rebuildTripsWithGroups(
    baseTrips: Trip[],
    filteredGroups: Group[]
  ): Trip[] {
    const groupsByTrip: Record<string, Group[]> = {};
    filteredGroups.forEach((g) => {
      if (!groupsByTrip[g.trip]) groupsByTrip[g.trip] = [];
      groupsByTrip[g.trip].push(g);
    });
    return baseTrips.map((tr) => ({
      ...tr,
      groups: groupsByTrip[tr._id] || [],
    }));
  }

  async function fetchAllData(cityFilter?: string) {
    setLoading(true);
    try {
      const [tripsResp, groupsResp] = await Promise.all([
        fetchTrips(cityFilter),
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
    } catch (error) {
      Alert.alert(
        "Failed to load trips",
        "Please check your connection and try again"
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrips(city?: string): Promise<Trip[]> {
    let url = `${process.env.EXPO_LOCAL_SERVER}/api/trips/all`;
    if (city?.trim()) {
      url += `?city=${encodeURIComponent(city.trim())}`;
    }
    const resp = await fetch(url);
    const data: Trip[] = await resp.json();
    return data.map((t) => ({ ...t, groups: t.groups || [] }));
  }

  async function fetchGroups(): Promise<Group[]> {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    const raw = await resp.json();
    return raw
      .filter((g: any) => g.status !== "complete")
      .map((g: any) => ({
        ...g,
        membersCount: Array.isArray(g.members) ? g.members.length : 0,
        leaderName: g.created_by?.username || "Unknown",
      }));
  }

  const handleSelectCity = useCallback(
    (coords: Coordinate, placeName: string) => {
      // Close popup if open
      if (popupTrip) {
        closeTripPopup();
      }

      location.setSearchCenter(coords);
      setCityQuery(placeName);
      filters.setCityFilter(placeName);

      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: coords,
          zoomLevel: 13,
          animationDuration: 1000,
        });
      }

      // Fetch trips for the selected city
      fetchAllData(placeName);
    },
    [popupTrip]
  );

  const handleClearCity = useCallback(() => {
    // Close popup if open
    if (popupTrip) {
      closeTripPopup();
    }

    filters.removeFilter(
      filters.activeFilters.find((f) => f.id.startsWith("city="))?.id || ""
    );
  }, [filters.activeFilters, popupTrip]);

  const handleCenterOnMe = useCallback(() => {
    // סגירת החיפוש כאשר לוחצים על center on me
    if (isSearchActive) {
      setIsSearchActive(false);
      setShouldCloseSearch(true);
    }

    // Close popup if open
    if (popupTrip) {
      closeTripPopup();
      return;
    }

    if (location.userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: location.userLocation,
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  }, [location.userLocation, popupTrip, isSearchActive]);

  const toggleViewMode = useCallback(() => {
    // סגירת החיפוש כאשר משנים מצב תצוגה
    if (isSearchActive) {
      setIsSearchActive(false);
      setShouldCloseSearch(true);
    }

    // Close popup if open
    if (popupTrip) {
      closeTripPopup();
    }

    // תמיד נשמור את המרכז הנוכחי לפני כל מעבר
    setLastMapCenter(location.currentCenter);

    if (viewMode === "map") {
      setCarouselVisible(false);
      setViewMode("list");
    } else {
      // תמיד נחזיר את המרכז האחרון כשחוזרים ל-map
      if (lastMapCenter) {
        location.setCenterFromCamera(lastMapCenter);
      }
      setViewMode("map");
    }
  }, [viewMode, popupTrip, isSearchActive, location, lastMapCenter]);

  const openTripPopup = useCallback(
    (trip: Trip) => {
      // סגירת החיפוש כאשר פותחים פופאפ
      if (isSearchActive) {
        setIsSearchActive(false);
        setShouldCloseSearch(true);
      }

      const sameLocationCount = trips.filter((t) => {
        const [lonA, latA] = t.location.coordinates;
        const [lonB, latB] = trip.location.coordinates;
        return lonA === lonB && latA === latB;
      }).length;

      const zoomLevel = sameLocationCount > 1 ? 20 : 16;

      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: trip.location.coordinates as [number, number],
          zoomLevel,
          animationDuration: 1000,
        });
      }

      setCarouselVisible(false);
      setPopupTrip(trip);

      Animated.timing(popupAnim, {
        toValue: 1,
        duration: theme.animation.normal,
        useNativeDriver: true,
      }).start();
    },
    [trips, isSearchActive]
  );

  const closeTripPopup = useCallback(() => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: theme.animation.normal,
      useNativeDriver: true,
    }).start(() => {
      setPopupTrip(null);
      if (viewMode === "map") {
        setCarouselVisible(true);
      }
    });
  }, [viewMode]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      // סגירת החיפוש כאשר מגללים בקרוסלה
      if (isSearchActive) {
        setIsSearchActive(false);
        setShouldCloseSearch(true);
      }

      const offsetX = e.nativeEvent.contentOffset.x;
      const newIdx = Math.round(offsetX / (SCREEN_WIDTH * 0.85));

      if (newIdx !== currentIndex) {
        setCurrentIndex(newIdx);
        const trip = trips[newIdx];

        if (trip?.location?.coordinates && cameraRef.current) {
          const sameLocationCount = trips.filter((t) => {
            const [lonA, latA] = t.location.coordinates;
            const [lonB, latB] = trip.location.coordinates;
            return lonA === lonB && latA === latB;
          }).length;

          const zoomLevel = sameLocationCount > 1 ? 20 : 16;

          cameraRef.current.setCamera({
            centerCoordinate: trip.location.coordinates as [number, number],
            zoomLevel,
            animationDuration: 1000,
          });
        }

        if (trip?._id) {
          setSelectedTripId(trip._id);
        }
      }
    },
    [currentIndex, trips, isSearchActive]
  );

  // Modal handlers
  const openTripFilterModal = useCallback(() => {
    // סגירת החיפוש כאשר פותחים פילטר
    if (isSearchActive) {
      setIsSearchActive(false);
      setShouldCloseSearch(true);
    }

    // Close popup if open
    if (popupTrip) {
      closeTripPopup();
    }

    setCarouselVisible(false);
    setShowTripFilter(true);
  }, [popupTrip, closeTripPopup, isSearchActive]);

  const openGroupFilterModal = useCallback(() => {
    // סגירת החיפוש כאשר פותחים פילטר
    if (isSearchActive) {
      setIsSearchActive(false);
      setShouldCloseSearch(true);
    }

    // Close popup if open
    if (popupTrip) {
      closeTripPopup();
    }

    setCarouselVisible(false);
    setShowGroupFilter(true);
  }, [popupTrip, closeTripPopup, isSearchActive]);

  const onApplyTripFilters = useCallback(
    (filteredTrips: Trip[], chosen: ActiveFilter[]) => {
      // Extract filter config from active filters
      const location =
        chosen
          .find((f) => f.id.startsWith("tripLocation="))
          ?.id.split("=")[1] || "";
      const tags = chosen
        .filter((f) => f.id.startsWith("tripTag="))
        .map((f) => f.id.split("=")[1]);

      filters.applyTripFilters({ location, tags });
      setShowTripFilter(false);
      if (viewMode === "map") setCarouselVisible(true);
    },
    [viewMode]
  );

  const onApplyGroupFilters = useCallback(
    (filteredGroups: Group[], chosen: ActiveFilter[]) => {
      // Extract filter config from active filters
      const difficulties = chosen
        .filter((f) => f.id.startsWith("groupDifficulty="))
        .map((f) => f.id.split("=")[1]);
      const statuses = chosen
        .filter((f) => f.id.startsWith("groupStatus="))
        .map((f) => f.id.split("=")[1]);
      const maxMembers =
        chosen
          .find((f) => f.id.startsWith("groupMaxMembers="))
          ?.id.split("=")[1] || "";
      const scheduledStart =
        chosen.find((f) => f.id.startsWith("groupStart="))?.id.split("=")[1] ||
        "";
      const scheduledEnd =
        chosen.find((f) => f.id.startsWith("groupEnd="))?.id.split("=")[1] ||
        "";

      filters.applyGroupFilters({
        difficulties,
        statuses,
        maxMembers,
        scheduledStart,
        scheduledEnd,
      });
      setShowGroupFilter(false);
      if (viewMode === "map") setCarouselVisible(true);
    },
    [viewMode]
  );

  // טיפול בלחיצה ארוכה על המפה להוספת טיול חדש
  const handleMapLongPress = useCallback(
    (coordinates: [number, number]) => {
      if (popupTrip) {
        closeTripPopup();
      }
      if (isSearchActive) {
        setIsSearchActive(false);
        setShouldCloseSearch(true);
      }
      setPendingAddTripLocation(coordinates);
    },
    [popupTrip, isSearchActive]
  );

  const handleAddTripMarkerPress = useCallback(() => {
    if (pendingAddTripLocation) {
      navigation.navigate("TripsStack", {
        screen: "CreateTripPage",
        params: {
          selectedCoordinates: pendingAddTripLocation,
        },
      });
      setPendingAddTripLocation(null);
    }
  }, [pendingAddTripLocation, navigation]);

  // Show no location fallback if needed
  if (location.permissionDenied && !location.searchCenter) {
    return (
      <NoLocationFallback
        onLocationSelect={handleSelectCity}
        errorMessage={location.locationError || undefined}
      />
    );
  }

  // Show loading while fetching location
  if (location.isLoadingLocation && !location.searchCenter) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-gray-600">Getting your location...</Text>
      </View>
    );
  }

  // Check if Mapbox is available
  if (!Mapbox || !Camera) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-gray-600">
          Maps are disabled in Expo Go. Please use a custom dev client to view
          maps.
        </Text>
      </View>
    );
  }

  const popupTranslateY = popupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  return (
    <View className="flex-1 bg-gray-50">
      {/* City Search Bar */}
      <View className="flex-row items-center justify-between space-x-2">
        <View className="flex-[4]">
          <CitySearchBar
            value={cityQuery}
            onChangeText={setCityQuery}
            onSelectLocation={handleSelectCity}
            onClearLocation={handleClearCity}
            shouldCloseResults={shouldCloseSearch}
            onSearchStart={() => {
              setIsSearchActive(true);
              setShouldCloseSearch(false);
            }}
          />
        </View>
      </View>

      {/* Map Header */}
      <MapHeader
        viewMode={viewMode}
        onToggleView={toggleViewMode}
        activeFilters={filters.activeFilters}
        onRemoveFilter={(filterId) => {
          // Close popup if open
          if (popupTrip) {
            closeTripPopup();
          }

          filters.removeFilter(filterId);

          if (filterId.startsWith("city=")) {
            setCityQuery("");
          }
        }}
        onOpenTripFilter={openTripFilterModal}
        onOpenGroupFilter={openGroupFilterModal}
      />

      {/* Map Content */}
      <MapContent
        trips={trips}
        viewMode={viewMode}
        loading={loading}
        centerCoordinate={location.currentCenter}
        carouselVisible={carouselVisible}
        selectedTripId={selectedTripId}
        hideControls={controlsDisabled}
        cameraRef={cameraRef}
        onCenterOnMe={handleCenterOnMe}
        onMarkerPress={openTripPopup}
        onOpenPopup={openTripPopup}
        onScrollEnd={handleScrollEnd}
        onListScrollStart={() => {
          if (popupTrip) closeTripPopup();
        }}
        onLongPress={handleMapLongPress}
        onPress={() => {
          // לחיצה רגילה תבטל את מצב ההוספה
          setPendingAddTripLocation(null);
        }}
        addTripMarkerLocation={pendingAddTripLocation}
        onAddTripMarkerPress={handleAddTripMarkerPress}
      />

      {/* Trip Popup */}
      {popupTrip && (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateY: popupTranslateY }],
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

      {/* Filter Modals */}
      <TripFilterModal
        visible={showTripFilter}
        onClose={() => {
          setShowTripFilter(false);
          if (viewMode === "map" && !popupTrip) setCarouselVisible(true);
        }}
        trips={allTrips}
        onApply={onApplyTripFilters}
        initialFilters={filters.tripFilters}
      />

      <GroupFilterModal
        visible={showGroupFilter}
        onClose={() => {
          setShowGroupFilter(false);
          if (viewMode === "map" && !popupTrip) setCarouselVisible(true);
        }}
        groups={allGroups}
        onApply={onApplyGroupFilters}
        initialFilters={filters.groupFilters}
      />
    </View>
  );
}
