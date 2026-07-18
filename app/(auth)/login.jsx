import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import { Link } from "expo-router";
import { useContext, useMemo, useState } from "react";

import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import { Colors } from "../../constants/Colors";
import { ThemeContext } from "../../context/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Login() {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Logging in with:", email, password);
  };
  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "stretch",
          paddingHorizontal: 24,
        }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <Spacer />
        <ThemedTextInput
          style={[styles.inputField]}
          placeholderTextColor={colorTheme.placeholder}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <ThemedTextInput
          style={[styles.inputField]}
          placeholder="Password"
          placeholderTextColor={colorTheme.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Spacer height={12} />
        <ThemedButton>
          <Text style={{ color: "#f2f2f2", textAlign: "center" }}>Log in</Text>
        </ThemedButton>
        <Spacer height={12} />
        <Link
          href="/register"
          style={{ color: colorTheme.text, textAlign: "center" }}
        >
          Register
        </Link>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      textAlign: "center",
      fontSize: 18,
      marginBottom: 30,
    },
    error: {
      color: colorTheme.warning,
      padding: 10,
      backgroundColor: "#f5c1c8",
      borderColor: colorTheme.warning,
      borderWidth: 1,
      borderRadius: 6,
      marginHorizontal: 10,
    },
    inputField: {
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colorTheme.border,
      paddingHorizontal: 16,
      backgroundColor: colorTheme.background,
    },
  });
