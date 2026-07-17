import React, { useContext, useMemo, useState } from "react";
import {
  TouchableWithoutFeedback,
  StyleSheet,
  Keyboard,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import { Colors } from "../../constants/Colors";
import { INTEREST_OPTIONS } from "../../constants/user";
import { ThemeContext } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

export default function Step1() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;

  const { updateUser } = useUser();

  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container} safe={true}>
        <Text style={styles.stepText}>STEP 1 OF 2</Text>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <ThemedText title={true} style={styles.heading}>
            Customize Your Experience
          </ThemedText>
          <Text style={styles.subHeading}>
            Choose your preferences to get started.
          </Text>

          <Spacer />
          <Text style={styles.sectionTitle}>Choose Appearance</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeCard, theme === "light" && styles.activeCard]}
              onPress={() => setTheme("light")}
            >
              <Text
                style={[
                  styles.cardText,
                  theme === "light" && styles.activeCardText,
                ]}
              >
                ☀️ Light Mode
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeCard, theme === "dark" && styles.activeCard]}
              onPress={() => setTheme("dark")}
            >
              <Text
                style={[
                  styles.cardText,
                  theme === "dark" && styles.activeCardText,
                ]}
              >
                🌙 Dark Mode
              </Text>
            </TouchableOpacity>
          </View>

          <Spacer />
          <Text style={styles.sectionTitle}>Select Your Interests</Text>
          <View style={styles.interestContainer}>
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[styles.chip, isSelected && styles.activeChip]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.activeChipText,
                    ]}
                  >
                    {interest} {isSelected && "✓"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.buttonRowContainer}>
          <TouchableOpacity
            style={styles.linkButtonAlternative}
            onPress={() => router.replace("/explore")}
          >
            <Text style={{ color: colorTheme.text, fontWeight: "500" }}>
              Skip All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              updateUser({ interests: selectedInterests });
              router.push("/step2");
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Next</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    stepText: {
      color: colorTheme.text,
      fontSize: 12,
      fontWeight: "bold",
      letterSpacing: 1,
      marginBottom: 4,
      marginTop: 20,
    },
    heading: {
      fontWeight: "bold",
      fontSize: 24,
      color: colorTheme.title,
    },
    subHeading: {
      color: colorTheme.text,
      fontSize: 14,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colorTheme.title,
      marginBottom: 12,
    },
    // Mode selection styling
    modeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    modeCard: {
      flex: 1,
      paddingVertical: 16,
      borderWidth: 2,
      borderColor: colorTheme.border,
      borderRadius: 12,
      alignItems: "center",
      marginHorizontal: 6,
      backgroundColor: colorTheme.background,
    },
    activeCard: {
      borderColor: colorTheme.border,
      backgroundColor: colorTheme.background,
    },
    cardText: {
      fontWeight: "600",
      color: colorTheme.text,
    },
    activeCardText: {
      color: colorTheme.title,
    },
    // Interest tags styling
    interestContainer: {
      flexDirection: "row",
      flexWrap: "wrap", // Allows chips to wrap to the next line dynamically
      marginHorizontal: -4,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colorTheme.border,
      margin: 4,
      backgroundColor: colorTheme.uiBackground,
    },
    activeChip: {
      backgroundColor: colorTheme.uiBackground,
      borderColor: colorTheme.border,
    },
    chipText: {
      color: colorTheme.text,
    },
    activeChipText: {
      color: colorTheme.title,
      fontWeight: "bold",
    },
    // Bottom Buttons dynamic layout styling
    buttonRowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "auto", // Automatically pushes the button container row down to the bottom
      marginBottom: 20,
    },
    linkButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      textAlign: "center", // Essential because Link acts as a Text wrapper natively
      transform: [{ scale: 1 }],
    },
    linkButtonPressed: {
      opacity: 0.7, // Mimics TouchableOpacity
      transform: [{ scale: 0.98 }], // Soft feedback click effect
    },
  });
