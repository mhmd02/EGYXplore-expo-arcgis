import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants/Colors";
import { ThemeContext } from "../../context/ThemeContext";

export default function MainLayout() {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const insets = useSafeAreaInsets();

  // Dynamic clean height calculation
  const tabHeight = 60 + (insets.bottom > 0 ? insets.bottom : 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Crucial fix: explicitly styling the container layout attributes
        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom > 0 ? insets.bottom : 16, // Places it cleanly above the system buttons
          left: 16, // Leave a gap on the left to see the rounded corners
          right: 16, // Leave a gap on the right to see the rounded corners

          backgroundColor: colorTheme.navBackground,
          height: "auto", // Slightly taller to account for vertical centering padding
          borderRadius: 50, // Gives the background clean, rounded corners

          // Perfect Center alignment properties
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 4,
          paddingBottom: 4,

          // Borders and Shadows
          borderWidth: 1,
          borderColor: colorTheme.border,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarActiveTintColor: colorTheme.iconColorFocused,
        tabBarInactiveTintColor: colorTheme.iconColor,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mission"
        options={{
          title: "Missions",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "medal" : "medal-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reward"
        options={{
          title: "Rewards",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "gift" : "gift-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          title: "Account",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
