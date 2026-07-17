import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";

export default function AuthLayout() {
  const router = useRouter();
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colorTheme.navBackground },
          headerTintColor: colorTheme.text,
        }}
      >
        <Stack.Screen name="login" options={{ headerTitle: "Login" }} />
        <Stack.Screen name="register" options={{ headerTitle: "Register" }} />
      </Stack>
    </>
  );
}
