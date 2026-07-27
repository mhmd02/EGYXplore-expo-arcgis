import {
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, Redirect, useRouter } from "expo-router";

import ThemedTextInput from "../components/ThemedTextInput";
import ThemedView from "../components/ThemedView";
import ThemedButton from "../components/ThemedButton";
import ThemedLogo from "../components/Logo";
import ThemedText from "../components/ThemedText";
import CustomThemedLoader from "../components/CustomThemedLoader";
import Spacer from "../components/Spacer";
import { Colors } from "../constants/Colors";
import { useUser } from "../context/UserContext";

export default function App() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token, user, isLoading } = useUser();

  if (isLoading) {
    return <CustomThemedLoader />;
  }
  if (user && token) return <Redirect href="/(main)/explore" />;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={{
          uri: "https://tse3.mm.bing.net/th/id/OIP.kmqAXRqJolR4do_OM1plJwHaHO?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
        }}
        style={styles.background}
        resizeMode="cover"
      >
        <View
          style={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <ThemedText style={styles.logoText}>EGYXPLORE</ThemedText>
          <View
            style={[
              styles.authContainer,
              { paddingTop: insets.top, paddingBottom: insets.bottom },
            ]}
          >
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <ThemedText style={styles.authText}>Sign in</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace("/register")}>
              <ThemedText style={styles.authText}>Sign up</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1, // Ensures the background takes up the whole screen
    width: "100%",
    height: "100%",
  },
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
  authText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff", // You might want white text if the background is dark
    textShadowColor: "rgba(0, 0, 0, 0.75)", // Adds a shadow to text so it's readable over images
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  authContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    gap: 15,
    zIndex: 10,
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
    fontWeight: "900",
    color: Colors.accent,
    letterSpacing: 4,
    textTransform: "uppercase",
    // Adding shadow to the logo as well to pop off the background
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
});
