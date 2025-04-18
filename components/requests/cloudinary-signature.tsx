export const getCloudinarySignature = async (folder: string) => {
  try {
    const response = await fetch(
      `${process.env.EXPO_LOCAL_SERVER}/api/cloudinary/cloudinary-signature?folder=${folder}`
    );
    // Check if response.ok; if not, log the text to see what's returned.
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Signature endpoint error:", errorText);
      return null;
    }
    const data = await response.json();
    return data; // { signature, timestamp, api_key, folder }
  } catch (error) {
    console.error("Error fetching Cloudinary signature:", error);
    return null;
  }
};
