import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";

import ThemedTextInput from "../components/ThemedTextInput";
import ThemedView from "../components/ThemedView";
import ThemedButton from "../components/ThemedButton";
import ThemedLogo from "../components/Logo";
import ThemedText from "../components/ThemedText";
import Spacer from "../components/Spacer";
import { Colors } from "../constants/Colors";

export default function App() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={[styles.container]}>
        <ThemedText style={styles.logoText}>EGYXPLORE</ThemedText>
        <Spacer />
        <ThemedButton
          style={styles.link}
          onPress={() => router.push("/login")}
        >
          <Text style={{ textAlign: "center" }}>EXPLORE</Text>
        </ThemedButton>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    position: "absolute", // Makes it float OVER the map
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  searchInput: {
    width: "80%",
    borderRadius: 12,
    padding: 10,
    // Adds a nice shadow so it stands out from the map
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    position: "absolute",
    width: "50%",
    right: 0,
  },
  link: {
    backgroundColor: "#ffdc4f",
    padding: 12,
    marginVertical: 10,
    borderRadius: 15,
    width: "35%",
    textAlign: "center",
  },
  logoText: {
    fontSize: 36,
    fontWeight: "900", // Extra bold font weight
    color: "#C19A6B", // Heritage Gold color
    letterSpacing: 4, // Spreads out letters for a modern luxury brand look
    textTransform: "uppercase", // Forces logo text to uppercase
  },
});
