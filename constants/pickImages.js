import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";
import { Alert } from "react-native";

const showAlert = (title, message) => {
  setTimeout(() => {
    Alert.alert(title, message);
  }, 100);
};

export const pickImageFromGallery = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    showAlert(
      "Permission Denied",
      "We need camera roll permissions to upload an avatar image.",
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    aspect: [1, 1],
    quality: 0.7,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
};

export const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    showAlert(
      "Permission Denied",
      "We need camera permissions to take an avatar image.",
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
};
