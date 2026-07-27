import { Stack } from "expo-router";
import { useUser } from "../../context/UserContext";
import CustomThemedLoader from "../../components/CustomThemedLoader";

export default function OnboardingLayout() {
  const { token, user, isLoading } = useUser();
  if (isLoading) {
    return <CustomThemedLoader />;
  }
  if (user && token) return <Redirect href="/(main)/explore" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hides the native navigation bar for a custom clean look
      }}
    >
      <Stack.Screen name="step1" />
      <Stack.Screen name="step2" />
    </Stack>
  );
}
