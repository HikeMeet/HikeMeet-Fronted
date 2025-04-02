export interface IImageModel {
  url: string;
  image_id: string;
  type: "image" | "video";
  video_sceenshot_url?: string;
}
