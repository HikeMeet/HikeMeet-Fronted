export interface IImageModel {
  url: string;
  image_id: string;
}
export interface Trip {
  _id: string;
  name: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  images?: IImageModel[];
  main_image?: IImageModel;
  tags?: string[];
  description?: string;
  createdBy: string;
}
