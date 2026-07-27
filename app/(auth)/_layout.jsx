import { Stack, useRouter, Redirect } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import CustomThemedLoader from "../../components/CustomThemedLoader";
export default function AuthLayout() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const { token, user, isLoading } = useUser();
  const colorTheme = Colors[theme] ?? Colors.light;

  if (isLoading) {
    return <CustomThemedLoader />;
  }
  if (user && token) return <Redirect href="/(main)/explore" />;

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
