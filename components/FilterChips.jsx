import { Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useContext } from "react";
import { Colors } from "../constants/Colors";
import { ThemeContext } from "../context/ThemeContext";

// Horizontal, single-select filter chips (used by mission / reward / trips lists).
//   options:  string[]      — the chip labels
//   selected: string        — the active option
//   onSelect: (value) => {} — called with the tapped option
export default function FilterChips({ options, selected, onSelect, style, contentContainerStyle }) {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.row, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {options.map((option) => {
        const active = selected === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.chip,
              {
                backgroundColor: active
                  ? Colors.primary
                  : colorTheme.uiBackground,
                borderColor: active ? Colors.primary : colorTheme.border,
              },
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[styles.text, { color: active ? "#fff" : colorTheme.text }]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontWeight: "600",
  },
});
