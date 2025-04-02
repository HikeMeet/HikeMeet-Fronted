import * as VideoThumbnails from "expo-video-thumbnails";
import { getCloudinarySignature } from "./requests/cloudinary-signature";
import { IImageModel } from "../interfaces/image-interface";



export const uploadMedia = async (
  uri: string,
  mediaType: "image" | "video"
): Promise<IImageModel | null> => {
  const signatureData = await getCloudinarySignature("post_media");
  if (!signatureData) {
    throw new Error("Could not get Cloudinary signature.");
  }

  // For videos, generate a screenshot (thumbnail) using expo-video-thumbnails.
  let videoScreenshot = "";
  if (mediaType === "video") {
    try {
      const { uri: screenshotUri } = await VideoThumbnails.getThumbnailAsync(
        uri,
        {
          time: 500, // Adjust time (milliseconds) as needed
        }
      );
      videoScreenshot = screenshotUri;
      console.log("Video screenshot generated:", screenshotUri);
    } catch (error) {
      console.error("Error generating video screenshot:", error);
    }
  }

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: `upload.${mediaType === "video" ? "mp4" : "jpg"}`,
    type: mediaType === "video" ? "video/mp4" : "image/jpeg",
  } as any);

  formData.append("api_key", signatureData.api_key);
  formData.append("timestamp", signatureData.timestamp);
  formData.append("signature", signatureData.signature);
  formData.append("folder", signatureData.folder);
  formData.append("resource_type", "auto");

  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dyebkjnoc/upload";
  try {
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    const uploadResult = await uploadResponse.json();
    console.log("Upload result:", uploadResult);
    const secureUrl =
      typeof uploadResult.secure_url === "string"
        ? uploadResult.secure_url
        : uploadResult.secure_url?.toString() || "";
    if (secureUrl && uploadResult.public_id) {
      return {
        url: secureUrl,
        image_id: uploadResult.public_id,
        type: mediaType,
        video_sceenshot_url:
          mediaType === "video" ? videoScreenshot : undefined,
      };
    } else {
      throw new Error("Failed to upload media.");
    }
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error;
  }
};
