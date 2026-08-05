import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import { Colors } from "../../../constants/Colors";

export default function TripsStackLayout() {
  const router = useRouter();

  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          headerBackVisible: false,
          animation: "slide_from_right",
          headerStyle: { backgroundColor: colorTheme.uiBackground },
          headerTintColor: colorTheme.title,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingRight: 15,
                marginTop: 10,
              }}
            >
              <Ionicons name="arrow-back" size={28} color={colorTheme.title} />
            </TouchableOpacity>
          ),
        }}
      >
        {/* 1. The Main List Screen */}
        <Stack.Screen
          name="index"
          options={{
            // We hide the header here because your Trips component
            // already has that nice big <ThemedText title={true}>Trips</ThemedText> header
            headerShown: false,
          }}
        />

        {/* 2. The Details Screen */}
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: true, // Turn the header on so we get the Back button
            title: "Trip Details",
            headerBackTitle: "Back", // Text next to the back arrow on iOS
          }}
        />
        <Stack.Screen
          name="ai"
          options={{ title: "AI Assistant", headerBackTitle: "Back" }}
        />

        {/* 3. The trip builder: review the draft picks + fill in the details */}
        <Stack.Screen
          name="create"
          options={{ title: "Review Trip", headerBackTitle: "Back" }}
        />

        {/* 4. Saved trips list and one saved trip */}
        <Stack.Screen
          name="my-trips/index"
          options={{ title: "My Trips", headerBackTitle: "Back" }}
        />
        <Stack.Screen
          name="my-trips/[tripId]"
          options={{ title: "Trip Details", headerBackTitle: "Back" }}
        />
      </Stack>
    </>
  );
}
