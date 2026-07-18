import { useContext } from "react";
import { Text, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemedText({ style, title = false, ...props }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const textColor = title ? colorTheme.title : colorTheme.text;

  return <Text style={[{ color: textColor }, style]} {...props} />;
}
