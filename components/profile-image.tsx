// // components/ProfileImage.tsx
// import React, { useState } from "react";
// import {
//   Image,
//   Pressable,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import {
//   getStorage,
//   ref,
//   uploadBytesResumable,
//   getDownloadURL,
// } from "firebase/storage";

// interface ProfileImageProps {
//   initialImageUrl: string;
//   size?: number;
// }

// const ProfileImage: React.FC<ProfileImageProps> = ({
//   initialImageUrl,
//   size = 100,
// }) => {
//   const [imageUri, setImageUri] = useState<string>(initialImageUrl);
//   const [uploading, setUploading] = useState<boolean>(false);

//   const handlePress = async () => {
//     // Request media library permissions
//     const permissionResult =
//       await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permissionResult.granted) {
//       Alert.alert(
//         "Permission Required",
//         "Media library permissions are required to pick an image."
//       );
//       return;
//     }

//     // Launch the image picker
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images, // Using Images here even if deprecated warnings appear; alternatively, check the latest docs.
//       quality: 1,
//     });

//     // Check if the picker was not canceled and assets are returned
//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       const asset = result.assets[0];
//       setImageUri(asset.uri);
//       await uploadImage(asset.uri);
//     }
//   };

//   const uploadImage = async (uri: string) => {
//     try {
//       setUploading(true);
//       const response = await fetch(uri);
//       const blob = await response.blob();

//       const storage = getStorage();
//       const filename = `profile_images/${Date.now()}_profile.jpg`;
//       const storageRef = ref(storage, filename);

//       const uploadTask = uploadBytesResumable(storageRef, blob);

//       uploadTask.on(
//         "state_changed",
//         (snapshot) => {
//           // Optionally track progress here
//         },
//         (error) => {
//           setUploading(false);
//           Alert.alert("Upload Failed", error.message);
//         },
//         async () => {
//           const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
//           setImageUri(downloadUrl);
//           setUploading(false);
//           // Optionally, update your backend with the new URL.
//         }
//       );
//     } catch (error: any) {
//       setUploading(false);
//       Alert.alert("Error", error.message);
//     }
//   };

//   return (
//     <Pressable
//       onPress={handlePress}
//       style={[
//         styles.pressable,
//         { width: size, height: size, borderRadius: size / 2 },
//       ]}
//     >
//       {uploading ? (
//         <ActivityIndicator size="small" />
//       ) : (
//         <Image
//           source={
//             imageUri
//               ? { uri: imageUri }
//               : require("../assets/default-profile.png")
//           }
//           style={{ width: size, height: size, borderRadius: size / 2 }}
//         />
//       )}
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   pressable: {
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
// });

// export default ProfileImage;
