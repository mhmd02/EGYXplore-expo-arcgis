import { TextInput, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { forwardRef, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ThemedTextInput({ style, ...props }, ref) {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  return (
    <TextInput
      style={[
        {
          backgroundColor: colorTheme.uiBackground,
          color: colorTheme.text,
          padding: 20,
          borderRadius: 12,
          paddingVertical: 18,
          borderColor: colorTheme.border,
        },
        style,
      ]}
      {...props}
      ref={ref}
    />
  );
}
export default forwardRef(ThemedTextInput);
