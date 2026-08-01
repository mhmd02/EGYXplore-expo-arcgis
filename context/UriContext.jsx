import { Alert } from "react-native";
import { createContext, useState, useEffect } from "react";
import { takePhoto, pickImageFromGallery } from "../constants/pickImages";
import { useUser } from "./UserContext";
import { uploadAvatar } from "../api/authApi";
import * as SecureStore from "expo-secure-store";

export const UriContext = createContext();

export default function UriProvider({ children }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, token, updateUser } = useUser();

  const handleTakePhoto = async () => {
    try {
      const localUri = await takePhoto();
      if (localUri) {
        setUploading(true);

        const response = await uploadAvatar(token, localUri);
        updateUser(response.user);
        await SecureStore.setItemAsync("user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Avatar upload failed", error);
      Alert.alert(
        "Upload failed",
        "Couldn't upload your photo. Please try again.",
      );
    } finally {
      setUploading(false);
      setAlertVisible(false);
    }
  };

  const handleChooseGallery = async () => {
    try {
      const localUri = await pickImageFromGallery();
      if (localUri) {
        setUploading(true);

        const response = await uploadAvatar(token, localUri);
        updateUser(response.user);
        await SecureStore.setItemAsync("user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Avatar upload failed", error);
      Alert.alert(
        "Upload failed",
        "Couldn't upload your photo. Please try again.",
      );
    } finally {
      setUploading(false);
      setAlertVisible(false);
    }
  };

  return (
    <UriContext.Provider
      value={{
        alertVisible,
        setAlertVisible,
        handleTakePhoto,
        handleChooseGallery,
        uploading,
      }}
    >
      {children}
    </UriContext.Provider>
  );
}
