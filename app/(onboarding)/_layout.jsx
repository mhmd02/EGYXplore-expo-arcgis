import { Stack } from "expo-router";

export default function OnboardingLayout() {
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
