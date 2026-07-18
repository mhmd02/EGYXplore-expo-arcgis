import { Alert } from "react-native";
import { useState } from "react";

// TODO(audio-migration): expo-av is deprecated and was removed during the SDK 57
// migration. Reimplement recording with `expo-audio` (useAudioRecorder /
// AudioModule.requestRecordingPermissionsAsync) and restore the real upload flow.
// This stub keeps the { isRecording, toggleRecording } contract so the AI screen
// renders and the mic button is inert instead of crashing.
export const useRecordAndUploadAudio = (onRecordingComplete) => {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    // No-op placeholder until the expo-audio implementation lands.
    Alert.alert(
      "Coming soon",
      "Voice recording is temporarily unavailable while we migrate to the new audio engine.",
    );
    setIsRecording(false);
  };

  return {
    isRecording,
    toggleRecording,
  };
};
