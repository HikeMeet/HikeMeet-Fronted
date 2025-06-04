import { useState, useCallback, useMemo } from "react";
import {
  FilterState,
  ActiveFilter,
  TripFilterConfig,
  GroupFilterConfig,
} from "../../../interfaces/map-interface";
import { Trip } from "../../../interfaces/trip-interface";
import { Group } from "../../../interfaces/group-interface";

export interface UseFilterManagerReturn {
  activeFilters: ActiveFilter[];
  tripFilters: TripFilterConfig;
  groupFilters: GroupFilterConfig;
  addFilter: (filter: ActiveFilter) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  applyTripFilters: (filters: TripFilterConfig) => void;
  applyGroupFilters: (filters: GroupFilterConfig) => void;
  filterTrips: (trips: Trip[]) => Trip[];
  filterGroups: (groups: Group[]) => Group[];
  setCityFilter: (cityName: string | null) => void;
}

const initialTripFilters: TripFilterConfig = {
  location: "",
  tags: [],
};

const initialGroupFilters: GroupFilterConfig = {
  difficulties: [],
  statuses: [],
  maxMembers: "",
  scheduledStart: "",
  scheduledEnd: "",
};

export function useFilterManager(): UseFilterManagerReturn {
  const [state, setState] = useState<FilterState>({
    activeFilters: [],
    tripFilters: initialTripFilters,
    groupFilters: initialGroupFilters,
  });

  const addFilter = useCallback((filter: ActiveFilter) => {
    setState((prev) => ({
      ...prev,
      activeFilters: [...prev.activeFilters, filter],
    }));
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setState((prev) => {
      const newFilters = prev.activeFilters.filter((f) => f.id !== filterId);

      // Update trip/group filters based on removed filter
      let newTripFilters = { ...prev.tripFilters };
      let newGroupFilters = { ...prev.groupFilters };

      if (filterId.startsWith("tripLocation=")) {
        newTripFilters.location = "";
      } else if (filterId.startsWith("tripTag=")) {
        const tag = filterId.split("=")[1];
        newTripFilters.tags = newTripFilters.tags.filter((t) => t !== tag);
      } else if (filterId.startsWith("groupDifficulty=")) {
        const diff = filterId.split("=")[1];
        newGroupFilters.difficulties = newGroupFilters.difficulties.filter(
          (d) => d !== diff
        );
      } else if (filterId.startsWith("groupStatus=")) {
        const status = filterId.split("=")[1];
        newGroupFilters.statuses = newGroupFilters.statuses.filter(
          (s) => s !== status
        );
      } else if (filterId.startsWith("groupMaxMembers=")) {
        newGroupFilters.maxMembers = "";
      } else if (filterId.startsWith("groupStart=")) {
        newGroupFilters.scheduledStart = "";
      } else if (filterId.startsWith("groupEnd=")) {
        newGroupFilters.scheduledEnd = "";
      }

      return {
        activeFilters: newFilters,
        tripFilters: newTripFilters,
        groupFilters: newGroupFilters,
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setState({
      activeFilters: [],
      tripFilters: initialTripFilters,
      groupFilters: initialGroupFilters,
    });
  }, []);

  const applyTripFilters = useCallback((filters: TripFilterConfig) => {
    setState((prev) => {
      const newActiveFilters = prev.activeFilters.filter(
        (f) => !f.id.startsWith("tripTag=") && !f.id.startsWith("tripLocation=")
      );

      if (filters.location) {
        newActiveFilters.push({
          id: `tripLocation=${filters.location}`,
          label: `Location: ${filters.location}`,
        });
      }

      filters.tags.forEach((tag) => {
        newActiveFilters.push({
          id: `tripTag=${tag}`,
          label: `Tag: ${tag}`,
        });
      });

      return {
        ...prev,
        activeFilters: newActiveFilters,
        tripFilters: filters,
      };
    });
  }, []);

  const applyGroupFilters = useCallback((filters: GroupFilterConfig) => {
    setState((prev) => {
      const newActiveFilters = prev.activeFilters.filter(
        (f) => !f.id.startsWith("group")
      );

      filters.difficulties.forEach((diff) => {
        newActiveFilters.push({
          id: `groupDifficulty=${diff}`,
          label: `Difficulty: ${diff}`,
        });
      });

      filters.statuses.forEach((status) => {
        newActiveFilters.push({
          id: `groupStatus=${status}`,
          label: `Status: ${status}`,
        });
      });

      if (filters.maxMembers) {
        newActiveFilters.push({
          id: `groupMaxMembers=${filters.maxMembers}`,
          label: `Max Members: ${filters.maxMembers}`,
        });
      }

      if (filters.scheduledStart) {
        newActiveFilters.push({
          id: `groupStart=${filters.scheduledStart}`,
          label: `Start: ${filters.scheduledStart}`,
        });
      }

      if (filters.scheduledEnd) {
        newActiveFilters.push({
          id: `groupEnd=${filters.scheduledEnd}`,
          label: `End: ${filters.scheduledEnd}`,
        });
      }

      return {
        ...prev,
        activeFilters: newActiveFilters,
        groupFilters: filters,
      };
    });
  }, []);

  const setCityFilter = useCallback((cityName: string | null) => {
    setState((prev) => {
      const newFilters = prev.activeFilters.filter(
        (f) => !f.id.startsWith("city=")
      );

      if (cityName) {
        newFilters.push({
          id: `city=${cityName}`,
          label: `City: ${cityName}`,
        });
      }

      return {
        ...prev,
        activeFilters: newFilters,
      };
    });
  }, []);

  const filterTrips = useCallback(
    (trips: Trip[]): Trip[] => {
      let filtered = [...trips];

      if (state.tripFilters.location) {
        filtered = filtered.filter((trip) =>
          trip.location.address
            .toLowerCase()
            .includes(state.tripFilters.location.toLowerCase())
        );
      }

      if (state.tripFilters.tags.length > 0) {
        filtered = filtered.filter((trip) =>
          state.tripFilters.tags.every((tag) =>
            (trip as any).tags?.includes(tag)
          )
        );
      }

      return filtered;
    },
    [state.tripFilters]
  );

  const filterGroups = useCallback(
    (groups: Group[]): Group[] => {
      let filtered = [...groups];

      if (state.groupFilters.statuses.length > 0) {
        filtered = filtered.filter((group) =>
          state.groupFilters.statuses.includes(
            group.status?.toLowerCase() || ""
          )
        );
      }

      if (state.groupFilters.difficulties.length > 0) {
        filtered = filtered.filter((group) =>
          state.groupFilters.difficulties.includes(
            (group as any).difficulty || ""
          )
        );
      }

      if (state.groupFilters.maxMembers) {
        const max = parseInt(state.groupFilters.maxMembers, 10);
        if (!isNaN(max)) {
          filtered = filtered.filter((group) => group.max_members <= max);
        }
      }

      if (state.groupFilters.scheduledStart) {
        filtered = filtered.filter(
          (group) =>
            (group as any).scheduled_start &&
            (group as any).scheduled_start >= state.groupFilters.scheduledStart
        );
      }

      if (state.groupFilters.scheduledEnd) {
        filtered = filtered.filter(
          (group) =>
            (group as any).scheduled_end &&
            (group as any).scheduled_end <= state.groupFilters.scheduledEnd
        );
      }

      return filtered;
    },
    [state.groupFilters]
  );

  return {
    activeFilters: state.activeFilters,
    tripFilters: state.tripFilters,
    groupFilters: state.groupFilters,
    addFilter,
    removeFilter,
    clearFilters,
    applyTripFilters,
    applyGroupFilters,
    filterTrips,
    filterGroups,
    setCityFilter,
  };
}
