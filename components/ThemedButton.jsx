import { Pressable, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";

export default function ThemedButton({ style, ...props }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
