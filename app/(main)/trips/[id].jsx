import { Image, Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";

import ThemedText from "../../../components/ThemedText";
import ThemedCard from "../../../components/ThemedCard";
import ThemedLoader from "../../../components/ThemedLoader";
import { trips } from "../../../constants/trips";
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
const pyramids = require("../../../assets/imgs/R.jpg");

export default function TripDetail() {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState(null);
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;

  useEffect(() => {
    async function loadTrip(id) {
      const tripId = trips.find((trip) => trip.id.toString() === id);
      setTrip(tripId);
    }
    loadTrip(id);
  }, [id]);

  if (!trip) {
    return <ThemedLoader />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colorTheme.background }]}
    >
      <Image source={pyramids} style={styles.image} />
      <View style={styles.cardContainer}>
        <ThemedCard style={styles.card}>
          <ThemedText>8am - 5pm</ThemedText>
          <ThemedText>Opening at</ThemedText>
        </ThemedCard>
        <ThemedCard style={styles.card}>
          <ThemedText>200 EGP</ThemedText>
          <ThemedText>Entry Fee</ThemedText>
        </ThemedCard>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16, // Add padding to the main screen so nothing touches the edges
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderRadius: 20, // Rounded corners look better for trip details
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: "row",
    alignContent: "space-between",
    gap: 12,
  },
  card: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
  },
});
