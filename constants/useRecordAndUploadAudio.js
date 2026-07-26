import { Alert } from "react-native";
import { useState } from "react";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";

export const useRecordAndUploadAudio = (onRecordingComplete) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await audioRecorder.stop();
        setIsRecording(false);
        const uri = audioRecorder.uri;
        if (onRecordingComplete && uri) {
          onRecordingComplete(uri);
        }
      } else {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Microphone access is temporarily unavailable. Please enable it in your device settings.",
          );
          return;
        }
        await audioRecorder.prepareToRecordAsync();
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        await audioRecorder.record();
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Recording error:", error);
      Alert.alert("Error", "An error occurred while trying to record audio.");
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    toggleRecording,
  };
};
