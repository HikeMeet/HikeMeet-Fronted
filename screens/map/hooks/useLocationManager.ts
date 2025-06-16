import { useState, useEffect, useCallback, useRef } from "react";
import * as Location from "expo-location";
import { Coordinate, LocationState } from "../../../interfaces/map-interface";
import { TEL_AVIV_COORDS } from "../../../utils/geo";
import { useAuth } from "../../../contexts/auth-context";

export interface UseLocationManagerReturn extends LocationState {
  currentCenter: Coordinate;
  requestLocationPermission: () => Promise<void>;
  setSearchCenter: (coords: Coordinate | null) => void;
  resetCenter: () => void;
  refreshUserLocation: () => Promise<void>;
  setCenterFromCamera: (coords: Coordinate) => void;
  resetToPolicy: () => void;
}

const LOCATION_TIMEOUT = 5000; // 5 seconds

interface ExtendedLocationState extends LocationState {
  cameraCenterOverride: Coordinate | null;
}

export function useLocationManager(): UseLocationManagerReturn {
  const [state, setState] = useState<ExtendedLocationState>({
    userLocation: null,
    searchCenter: null,
    cameraCenterOverride: null,
    isLoadingLocation: true,
    locationError: null,
    permissionDenied: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const { userLocationState } = useAuth(); // current user's mongoId
  // Calculate current center based on priority
  // Priority: cameraCenterOverride > searchCenter > userLocation > default
  const currentCenter: Coordinate =
    state.cameraCenterOverride ||
    state.searchCenter ||
    state.userLocation ||
    TEL_AVIV_COORDS;

  const requestLocationPermission = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isLoadingLocation: true,
        locationError: null,
      }));

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setState((prev) => ({
          ...prev,
          permissionDenied: true,
          isLoadingLocation: false,
          locationError: "Location permission denied",
        }));
        return;
      }

      // Set a timeout for location fetch
      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isLoadingLocation: false,
          locationError: "Location request timed out",
        }));
      }, LOCATION_TIMEOUT);

      const location = userLocationState;

      clearTimeout(timeoutRef.current);

      const coords: Coordinate = location!;

      setState((prev) => ({
        ...prev,
        userLocation: userLocationState || coords,
        isLoadingLocation: false,
        locationError: null,
        permissionDenied: false,
      }));
    } catch (error) {
      clearTimeout(timeoutRef.current);
      setState((prev) => ({
        ...prev,
        isLoadingLocation: false,
        locationError:
          error instanceof Error ? error.message : "Failed to get location",
      }));
    }
  }, []);

  const refreshUserLocation = useCallback(async () => {
    if (state.permissionDenied) return;
    await requestLocationPermission();
  }, [state.permissionDenied, requestLocationPermission]);

  const setSearchCenter = useCallback((coords: Coordinate | null) => {
    setState((prev) => ({
      ...prev,
      searchCenter: coords,
      // Clear camera override when explicitly setting search center
      cameraCenterOverride: null,
    }));
  }, []);

  const resetCenter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchCenter: null,
    }));
  }, []);

  const setCenterFromCamera = useCallback((coords: Coordinate) => {
    setState((prev) => ({
      ...prev,
      cameraCenterOverride: coords,
      // Don't clear searchCenter or userLocation, just override temporarily
    }));
  }, []);

  const resetToPolicy = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cameraCenterOverride: null,
      // This will cause currentCenter to revert to searchCenter || userLocation || default
    }));
  }, []);

  // Request location on mount
  useEffect(() => {
    requestLocationPermission();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    userLocation: state.userLocation,
    searchCenter: state.searchCenter,
    isLoadingLocation: state.isLoadingLocation,
    locationError: state.locationError,
    permissionDenied: state.permissionDenied,
    currentCenter,
    requestLocationPermission,
    setSearchCenter,
    resetCenter,
    refreshUserLocation,
    setCenterFromCamera,
    resetToPolicy,
  };
}
