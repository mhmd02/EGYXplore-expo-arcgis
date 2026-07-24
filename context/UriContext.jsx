import { createContext, useState } from "react";
import { takePhoto, pickImageFromGallery } from "../constants/pickImages";

export const UriContext = createContext();

export default function UriProvider({ children }) {
  const [profileImage, setProfileImage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) setProfileImage(uri);
    setAlertVisible(false);
  };

  const handleChooseGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setProfileImage(uri);
    setAlertVisible(false);
  };

  return (
    <UriContext.Provider
      value={{
        profileImage,
        setProfileImage,
        alertVisible,
        setAlertVisible,
        handleTakePhoto,
        handleChooseGallery,
      }}
    >
      {children}
    </UriContext.Provider>
  );
}
