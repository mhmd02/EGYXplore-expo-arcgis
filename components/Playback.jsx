import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import { useEvent } from "expo";
export default function VoiceNotePlayer({ uri, style, colorTheme }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing;
  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      if (player.currentTime >= player.duration && player.duration > 0) {
        player.seekTo(0);
      }
      player.play();
    }
  };
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={togglePlayPause}
    >
      <Ionicons
        name={isPlaying ? "pause-circle" : "play-circle"}
        size={24}
        color="white"
      />
      <ThemedText style={[styles.text, { color: "white" }]}>
        {isPlaying ? "Playing..." : "Voice note"}
      </ThemedText>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontSize: 13,
  },
});
