import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useContext, useMemo, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { ThemeContext } from "../../context/ThemeContext";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";

export default function Register() {
  const router = useRouter();
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);

  // Add-Input-to-Context using controlled elements
  const { updateUser } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    updateUser({ firstName, lastName, sex, country, phone, email });
    router.push("/step1");
  };
  return (
    <ThemedView style={styles.container} safe={true}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 20,
        }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={60}
      >
        <Spacer height={5} />
        <View style={{ flexDirection: "row", width: "100%", gap: 10 }}>
          <ThemedTextInput
            style={[styles.inputField, { flex: 1 }]}
            placeholder="First name"
            placeholderTextColor={colorTheme.placeholder}
            value={firstName}
            onChangeText={setFirstName}
          />
          <ThemedTextInput
            style={[styles.inputField, { flex: 1 }]}
            placeholder="Last name"
            placeholderTextColor={colorTheme.placeholder}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Sex & Country Side-by-Side */}
        <View style={{ flexDirection: "row", width: "100%", gap: 10 }}>
          <ThemedTextInput
            style={[styles.inputField, { flex: 1 }]}
            placeholder="Sex"
            placeholderTextColor={colorTheme.placeholder}
            value={sex}
            onChangeText={setSex}
          />
          <ThemedTextInput
            style={[styles.inputField, { flex: 1 }]}
            placeholder="Country"
            placeholderTextColor={colorTheme.placeholder}
            value={country}
            onChangeText={setCountry}
          />
        </View>

        <ThemedTextInput
          style={styles.inputField}
          placeholder="Phone"
          keyboardType="phone-pad"
          placeholderTextColor={colorTheme.placeholder}
          value={phone}
          onChangeText={setPhone}
        />
        <ThemedTextInput
          style={styles.inputField}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor={colorTheme.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <ThemedTextInput
          style={styles.inputField}
          placeholder="Password"
          placeholderTextColor={colorTheme.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <ThemedTextInput
          style={styles.inputField}
          placeholder="Confirm Password"
          placeholderTextColor={colorTheme.placeholder}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />
        <Spacer height={12} />
        <View>
          <ThemedButton onPress={handleRegister}>
            <Text style={{ color: "#f2f2f2", textAlign: "center" }}>
              Register
            </Text>
          </ThemedButton>
          <Spacer height={12} />
          <Link
            href="/login"
            style={{ color: colorTheme.text, textAlign: "center" }}
          >
            Log in
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorTheme.background,
    },
    headerContainer: {
      alignItems: "center",
      marginBottom: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colorTheme.title,
      textAlign: "center",
      marginBottom: 4,
    },
    subTitle: {
      fontSize: 14,
      color: colorTheme.text,
      textAlign: "center",
    },
    inputField: {
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colorTheme.border,
      paddingHorizontal: 16,
      backgroundColor: colorTheme.background,
    },
    submitButton: {
      width: "100%",
      height: 52,
      borderRadius: 12,
      backgroundColor: "#C19A6B",
      justifyContent: "center",
      alignItems: "center",
    },
    submitButtonText: {
      color: "#FFFFFF",
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
    },
    footerLinks: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    footerText: {
      fontSize: 14,
      color: "#64748B",
    },
    inlineLink: {
      fontSize: 14,
      fontWeight: "700",
      color: "#C19A6B",
    },
    secondaryLinkText: {
      fontSize: 13,
      color: "#94A3B8",
      textAlign: "center",
      textDecorationLine: "underline",
    },
    error: {
      color: Colors.warning,
      padding: 10,
      backgroundColor: "#f5c1c8",
      borderColor: Colors.warning,
      borderWidth: 1,
      borderRadius: 6,
      marginHorizontal: 10,
    },
  });
