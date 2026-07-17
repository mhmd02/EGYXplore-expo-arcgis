import { View, StyleSheet } from "react-native";
import { useContext } from "react";
import { Colors } from "../constants/Colors";
import { ThemeContext } from "../context/ThemeContext";

// Elevated themed surface used across lists, details, account and settings.
// Owns the background/border/radius/shadow; pass `style` to add layout
// (e.g. flexDirection, margins) or override.
export default function Card({ style, children, ...props }) {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colorTheme.uiBackground,
          borderColor: colorTheme.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    // Soft shadow to lift the card off the background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});
