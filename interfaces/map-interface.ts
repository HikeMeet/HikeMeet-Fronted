/**
 * Map-specific type definitions
 */

export type Coordinate = [number, number]; // [longitude, latitude]

export type ViewMode = "map" | "list";

export interface MapCenter {
  coordinates: Coordinate;
  source: "user" | "search" | "default";
}

export interface LocationState {
  userLocation: Coordinate | null;
  searchCenter: Coordinate | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  permissionDenied: boolean;
}

export interface FilterState {
  activeFilters: ActiveFilter[];
  tripFilters: TripFilterConfig;
  groupFilters: GroupFilterConfig;
}

export interface ActiveFilter {
  id: string;
  label: string;
}

export interface TripFilterConfig {
  location: string;
  tags: string[];
}

export interface GroupFilterConfig {
  difficulties: string[];
  statuses: string[];
  maxMembers: string;
  scheduledStart: string;
  scheduledEnd: string;
}

export interface MapControlsState {
  viewMode: ViewMode;
  carouselVisible: boolean;
  popupTrip: string | null; // Trip ID
  showTripFilter: boolean;
  showGroupFilter: boolean;
}
