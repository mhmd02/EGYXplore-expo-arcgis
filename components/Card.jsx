import { View, StyleSheet } from "react-native";
import { useContext } from "react";
import { Colors } from "../constants/Colors";
import { ThemeContext } from "../context/ThemeContext";

// Elevated themed surface used across lists, details, account and settings.
// Pass variant="pharaonic" for an Ancient Egyptian look with gold borders & accents.
export default function Card({
  style,
  children,
  variant = "default",
  ...props
}) {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;

  const isPharaonic = variant === "pharaonic";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colorTheme.uiBackground,
          borderColor: isPharaonic
            ? "#D4AF37" // Rich Pharaoh Gold
            : colorTheme.border,
          borderWidth: isPharaonic ? 2 : 1,
        },
        isPharaonic && styles.pharaonicCard,
        style,
      ]}
      {...props}
    >
      {/* Optional decorative inner border line for a chiseled artifact feel */}
      {isPharaonic && (
        <View
          style={[styles.innerBorder, { borderColor: "#D4AF37" }]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  pharaonicCard: {
    // Slightly heavier shadow for a heavier stone/artifact weight
    shadowColor: "#D4AF37",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  innerBorder: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    right: 4,
    borderWidth: 1,
    borderRadius: 10,
    opacity: 0.4, // Subtle frame effect
  },
});
