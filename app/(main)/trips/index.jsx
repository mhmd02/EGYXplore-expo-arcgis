import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useContext, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { trips } from "../../../constants/trips";
import { ThemeContext } from "../../../context/ThemeContext";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import ThemedButton from "../../../components/ThemedButton";
import FilterChips from "../../../components/FilterChips";

export default function Trips() {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedTripIds, setAddedTripIds] = useState([]);
  const router = useRouter();

  const toggleAddTrip = (id) => {
    setAddedTripIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((tripId) => tripId !== id)
        : [...prevIds, id],
    );
  };

  const categories = ["All", ...new Set(trips.map((trip) => trip.category))];
  const visibleTrips =
    selectedCategory === "All"
      ? trips
      : trips.filter((trip) => trip.category === selectedCategory);

  const renderItems = ({ item }) => {
    const isAdded = addedTripIds.includes(item.id);

    return (
      <ThemedCard style={styles.card} key={item.id}>
        <ThemedText style={styles.title} title={true}>
          {item.title}
        </ThemedText>
        <ThemedText>{item.location}</ThemedText>
        <ThemedText>{item.category}</ThemedText>
        <TouchableOpacity
          onPress={() => router.push(`/trips/${item.id}`)}
          style={styles.detailsButton}
        >
          <ThemedText
            style={{ color: Colors.accent, textAlignVertical: "center" }}
          >
            More details
          </ThemedText>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={Colors.accent}
            style={{ transform: [{ translateY: 2 }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[isAdded ? styles.done : styles.addIcon]}
          onPress={() => toggleAddTrip(item.id)}
        >
          <Text style={{ color: isAdded ? Colors.success : "white" }}>
            {isAdded ? "✓ Done" : "Add"}
          </Text>
        </TouchableOpacity>
      </ThemedCard>
    );
  };
  return (
    <ThemedView safe={true} style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText
          title={true}
          style={[styles.header, { transform: [{ translateY: -4 }] }]}
        >
          Trips
        </ThemedText>

        <View style={styles.iconButtonContainer}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16 }}>Create</Text>
          </TouchableOpacity>

          {/* AI Icon */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colorTheme.text }]}
            onPress={() => router.push("/trips/ai")}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={theme === "dark" ? "black" : "#fff"}
            />
            <Text
              style={{
                color: theme === "dark" ? "#000" : "#fff",
                fontSize: 16,
              }}
            >
              AI
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <FilterChips
        options={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        style={styles.typeRow}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
      />
      <FlatList
        data={visibleTrips}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderItems}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    marginHorizontal: 16, // Changed to marginHorizontal to align better
    marginVertical: 8,
  },
  title: { fontWeight: "bold", fontSize: 18 },
  typeRow: {
    flexGrow: 0,
    minHeight: 35,
    marginTop: 16,
    marginBottom: 16,
  },
  addIcon: {
    flex: 1,
    position: "absolute",
    flexDirection: "row",
    right: 20,
    paddingRight: 20,
    top: 50,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  done: {
    flex: 1,
    position: "absolute",
    flexDirection: "row",
    right: 20,
    paddingRight: 20,
    top: 50,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderColor: Colors.success,
    borderWidth: 1,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center", // Centers the text and icon vertically
    gap: 4, // Adds a little breathing room between text and icon
    paddingVertical: 8, // Makes the touch target easier to tap
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Pushes Title to left, Icons to right
    paddingHorizontal: 16,
    marginTop: 10,
  },
  iconButtonContainer: {
    flexDirection: "row",
    gap: 12, // Space between the two icons
    alignItems: "center",
  },
  iconBtn: {
    flexDirection: "row",
    gap: 4,
    padding: 12,
    borderRadius: 20, // Circular buttons
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
});
