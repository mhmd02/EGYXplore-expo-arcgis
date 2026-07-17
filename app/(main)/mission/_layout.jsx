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
              <Ionicons
                name="chevron-back"
                size={24}
                color={colorTheme.title}
              />
            </TouchableOpacity>
          ),
        }}
      >
        {/* 1. The Main List Screen */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* 2. The Details Screen */}
        <Stack.Screen
          name="[id]"
          options={{
            title: "Mission Details",
          }}
        />
      </Stack>
    </>
  );
}
