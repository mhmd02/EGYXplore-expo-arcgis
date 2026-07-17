import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const tests = [
    { name: "Test 1: Basic Maps", route: "/test-map" },
    { name: "Test 2: Feature Layers", route: "/test-layers" },
    { name: "Test 3: Search / Geocoding", route: "/test-search" },
    { name: "Test 4: Routing", route: "/test-routing" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ArcGIS Expo Tests</Text>
      {tests.map((test, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => router.push(test.route)}
        >
          <Text style={styles.buttonText}>{test.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
