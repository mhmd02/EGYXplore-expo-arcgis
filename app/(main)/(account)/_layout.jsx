import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useContext } from "react";
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
export default function ActivitiesLayout() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "left",
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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="personal-info"
          options={{ title: "Personal Information" }}
        />
        <Stack.Screen name="settings" options={{ title: "Account Settings" }} />
      </Stack>
    </>
  );
}
