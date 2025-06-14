// Mock trips data
const mockTrips = [
  {
    _id: "trip-1",
    name: "Mountain Adventure",
    location: {
      address: "Rocky Mountains, CO",
      coordinates: [-105.2705, 39.7392],
    },
    description: "Amazing mountain hike",
    tags: ["Hiking", "Mountains"],
    createdBy: "user-1",
    images: [],
    avg_rating: 4.2,
  },
  {
    _id: "trip-2",
    name: "Beach Paradise",
    location: {
      address: "Malibu Beach, CA",
      coordinates: [-118.7798, 34.0259],
    },
    description: "Relaxing beach trip",
    tags: ["Beach", "Relaxation"],
    createdBy: "user-2",
    images: [],
    avg_rating: 4.8,
  },
  {
    _id: "trip-3",
    name: "City Explorer",
    location: { address: "New York, NY", coordinates: [-74.006, 40.7128] },
    description: "Urban exploration",
    tags: ["City", "Culture"],
    createdBy: "user-1",
    images: [],
    avg_rating: 4.0,
  },
];

export const fetchTrips = jest.fn().mockResolvedValue(mockTrips);

export const fetchTripsByIds = jest
  .fn()
  .mockImplementation((tripIds: string[]) => {
    const filteredTrips = mockTrips.filter((trip) =>
      tripIds.includes(trip._id)
    );
    return Promise.resolve(filteredTrips);
  });

// Reset function for tests
export const resetMockTrips = () => {
  fetchTrips.mockClear();
  fetchTripsByIds.mockClear();
  fetchTrips.mockResolvedValue(mockTrips);
  fetchTripsByIds.mockImplementation((tripIds: string[]) => {
    const filteredTrips = mockTrips.filter((trip) =>
      tripIds.includes(trip._id)
    );
    return Promise.resolve(filteredTrips);
  });
};
