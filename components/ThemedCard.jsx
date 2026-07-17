import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useContext } from "react";
import { Colors } from "../constants/Colors";
import { ThemeContext } from "../context/ThemeContext";
const ThemedCard = ({ style, ...props }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;
  return (
    <View
      style={[
        {
          backgroundColor: colorTheme.uiBackground,
        },
        styles.card,
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },
});
