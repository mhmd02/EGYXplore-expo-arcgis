// hooks/useMissionPhotos.js
import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import { takePhoto } from "../constants/pickImages";
import { verifyMissionPhotos } from "../api/missionPhotoApi";
import { useUser } from "../context/UserContext";

const uriToBase64 = async (uri) => {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

export function useMissionPhotos(missionId, minRequired) {
  const [images, setImages] = useState([]); // [{ uri, status, reason }]
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [verificationToken, setVerificationToken] = useState(null);
  const [verificationPayload, setVerificationPayload] = useState(null);

  const addPhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      setImages((prev) => [...prev, { uri, status: "pending", reason: null }]);
    }
  };

  const retakePhoto = async (index) => {
    const uri = await takePhoto();
    if (uri) {
      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { uri, status: "pending", reason: null } : img,
        ),
      );
    }
  };

  const verifyPhotos = async () => {
    setVerifying(true);
    setError(null);
    try {
      const base64Images = await Promise.all(
        images.map((img) => uriToBase64(img.uri)),
      );
      const data = await verifyMissionPhotos(missionId, base64Images);

      setImages((prev) =>
        prev.map((img, i) => ({
          ...img,
          status: data.results[i]?.satisfies ? "pass" : "fail",
          reason: data.results[i]?.reason ?? null,
        })),
      );
      setCompleted(data.verified);
      setVerificationToken(data.verificationToken ?? null);
      setVerificationPayload(data.verificationPayload ?? null);

      if (!data.verified) {
        setError(
          "Some photos don't match the requirements — retake the flagged ones and verify again.",
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return {
    images,
    verifying,
    completed,
    error,
    canVerify: images.length >= minRequired,
    addPhoto,
    retakePhoto,
    verifyPhotos,
    verificationToken,
    verificationPayload,
  };
}
