import { Audio } from "expo-av";
import { Alert } from "react-native";
import { useState } from "react";

export const useRecordAndUploadAudio = (onRecordingComplete) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  // 1. Request Permissions
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need microphone permissions to record your ask.",
        );
        return;
      }
      // 2. Configure the native audio engine
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 3. Start Recording
      console.log("Recording Started...");
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log("Stopping recording...");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording saved locally at:", uri);

      // Clean up states
      setRecording(null);
      setIsRecording(false);

      // Reset OS audio settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Send the file path back to the Chat UI
      if (uri && onRecordingComplete) {
        onRecordingComplete(uri);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Could not stop recording safely.");
      setRecording(null);
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  return {
    isRecording,
    toggleRecording,
  };
};
