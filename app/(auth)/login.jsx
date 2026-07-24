import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useContext, useMemo, useState } from "react";

import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import { Colors } from "../../constants/Colors";
import { ThemeContext } from "../../context/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { loginSchema } from "../../schema/authSchema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
export default function Login() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [loggedUser, setLoggedUser] = useState({});
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = (data) => {
    setLoggedUser(data);
    router.replace("/explore");
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
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              style={[styles.inputField]}
              placeholderTextColor={colorTheme.placeholder}
              placeholder="Email"
              keyboardType="email-address"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              style={[styles.inputField]}
              placeholder="Password"
              placeholderTextColor={colorTheme.placeholder}
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
        <Spacer height={12} />
        <ThemedButton onPress={handleSubmit(onSubmit)}>
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
    inputField: {
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colorTheme.border,
      paddingHorizontal: 16,
      backgroundColor: colorTheme.background,
    },
    errorText: {
      color: "#FF3B30",
      fontSize: 11,
      marginBottom: 8,
      marginLeft: 4,
    },
  });
