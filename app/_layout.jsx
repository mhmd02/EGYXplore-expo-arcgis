import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import ThemeProvider, { ThemeContext } from "../context/ThemeContext";
import { Colors } from "../constants/Colors";
import { ProgressProvider } from "../context/ProgressContext";
import { UserProvider } from "../context/UserContext";
import SettingsProvider from "../context/SettingsContext";
import UriProvider from "../context/UriContext";
import { useUser } from "../context/UserContext";
import ContentProvider from "../context/ContentContext";
import TripDraftProvider from "../context/TripDraftContext";
import CustomThemedLoader from "../components/CustomThemedLoader";

function MainLayout() {
  const context = useContext(ThemeContext);
  if (!context) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }
  const { theme } = context;
  const colorTheme = Colors[theme] || Colors.light;
  const { user, token, isLoading } = useUser();
  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorTheme.navBackground,
          },
          headerTintColor: colorTheme.title,
          headerTitleAlign: "left",
          headerShown: true,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Protected guard={Boolean(user && token)}>
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ProgressProvider>
          <SettingsProvider>
            <UriProvider>
              <ContentProvider>
                <TripDraftProvider>
                  <MainLayout />
                </TripDraftProvider>
              </ContentProvider>
            </UriProvider>
          </SettingsProvider>
        </ProgressProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
