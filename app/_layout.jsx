import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'ArcGIS Tests' }} />
      <Stack.Screen name="test-map" options={{ title: 'Test 1: Map' }} />
      <Stack.Screen name="test-layers" options={{ title: 'Test 2: Layers' }} />
      <Stack.Screen name="test-search" options={{ title: 'Test 3: Search' }} />
      <Stack.Screen name="test-routing" options={{ title: 'Test 4: Routing' }} />
    </Stack>
  );
}
