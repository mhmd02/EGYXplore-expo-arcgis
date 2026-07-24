import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import ThemeProvider, { ThemeContext } from "../context/ThemeContext";
import { Colors } from "../constants/Colors";
import { ProgressProvider } from "../context/ProgressContext";
import { UserProvider } from "../context/UserContext";
import SettingsProvider from "../context/SettingsContext";
import UriProvider from "../context/UriContext";

function MainLayout() {
  const context = useContext(ThemeContext);
  if (!context) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }
  const { theme } = context;
  const colorTheme = Colors[theme] || Colors.light;

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorTheme.navBackground,
          },
          headerTintColor: colorTheme.title,
          headerTitleAlign: "center",
          headerShown: true,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <UserProvider>
          <SettingsProvider>
            <UriProvider>
              <MainLayout />
            </UriProvider>
          </SettingsProvider>
        </UserProvider>
      </ProgressProvider>
    </ThemeProvider>
  );
}
