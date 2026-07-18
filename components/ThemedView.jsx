import { StyleSheet, Text, View, useColorScheme } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContext } from "react";
import { Colors } from "../constants/Colors";
import { ThemeContext } from "../context/ThemeContext";
const ThemedView = ({ style, safe = false, ...props }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;
  const insests = useSafeAreaInsets();

  if (!safe) {
    return (
      <View
        style={[{ backgroundColor: colorTheme.background }, style]}
        {...props}
      />
    );
  }
  return (
    <View
      style={[
        {
          backgroundColor: colorTheme.background,
          paddingTop: insests.top,
          paddingBottom: insests.bottom,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedView;

const styles = StyleSheet.create({});
