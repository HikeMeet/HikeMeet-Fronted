export const filterTripsByFilters = (
  tripsList: any[],
  filters: { id: string; label: string }[]
) => {
  let filtered = [...tripsList];
  filters.forEach((f) => {
    if (f.id.startsWith("tripTag=")) {
      const tag = f.id.split("=")[1];
      filtered = filtered.filter((t: any) => t.tags?.includes(tag));
    }
    if (f.id.startsWith("tripLocation=")) {
      const loc = f.id.split("=")[1].toLowerCase();
      filtered = filtered.filter((t: any) =>
        t.location.address?.toLowerCase().includes(loc)
      );
    }
  });
  return filtered;
};

export const filterGroupsByFilters = (
  groupsList: any[],
  filters: { id: string; label: string }[]
) => {
  let filtered = [...groupsList];
  filters.forEach((f) => {
    if (f.id.startsWith("groupDifficulty=")) {
      const diff = f.id.split("=")[1];
      filtered = filtered.filter((g: any) => g.difficulty === diff);
    }
    if (f.id.startsWith("groupStatus=")) {
      const status = f.id.split("=")[1].toLowerCase();
      filtered = filtered.filter(
        (g: any) => g.status?.toLowerCase() === status
      );
    }
    if (f.id.startsWith("groupMaxMembers=")) {
      const max = parseInt(f.id.split("=")[1], 10);
      filtered = filtered.filter((g) => !isNaN(max) && g.max_members <= max);
    }
    if (f.id.startsWith("groupStart=")) {
      const start = f.id.split("=")[1];
      filtered = filtered.filter((g: any) => g.scheduled_start >= start);
    }
    if (f.id.startsWith("groupEnd=")) {
      const end = f.id.split("=")[1];
      filtered = filtered.filter((g: any) => g.scheduled_end <= end);
    }
  });
  return filtered;
};
