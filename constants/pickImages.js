import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const pickImageFromGalleryMultiple = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("We need camera roll permissions to upload an avatar image.");
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    aspect: [1, 1],
    quality: 0.7,
    allowsMultipleSelection: true,
  });
  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets.map((asset) => asset.uri);
  }
  return null;
};

export const pickImageFromGallery = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("We need camera roll permissions to upload an avatar image.");
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    aspect: [1, 1],
    quality: 0.7,
  });
  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
};

export const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permisson Denied",
      "We need camera permissions to take a photo.",
    );
    return;
  }

  let result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
};
