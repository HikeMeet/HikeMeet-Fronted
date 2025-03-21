export interface Trip {
  _id: string;
  name: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  images?: string[];
  tags?: string[];
  description?: string;
}
