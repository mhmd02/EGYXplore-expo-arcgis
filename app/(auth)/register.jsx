import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useContext, useMemo, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "../../context/ThemeContext";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import { UriContext } from "../../context/UriContext";
import CustomAlert from "../../components/CustomAlert";
import { Ionicons } from "@expo/vector-icons";
import { registerSchema } from "../../schema/authSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
export default function Register() {
  const router = useRouter();
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const insets = useSafeAreaInsets();
  const keyboardOffset = insets.top + 44;
  const { register } = useUser();
  const [submitError, setSubmitError] = useState(null);
  const {
    profileImage,
    setProfileImage,
    alertVisible,
    setAlertVisible,
    handleTakePhoto,
    handleChooseGallery,
  } = useContext(UriContext);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      country: "",
    },
  });

  const imageName = profileImage
    ? profileImage.split("/").pop()
    : "Selected image";

  const onSubmit = async (data) => {
    try {
      await register(data);
      router.push("/step1");
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={50}
        extraHeight={100}
      >
        <Spacer height={5} />
        <View style={{ flexDirection: "row", width: "100%", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedTextInput
                  style={styles.inputField}
                  placeholder="First name"
                  placeholderTextColor={colorTheme.placeholder}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedTextInput
                  style={styles.inputField}
                  placeholder="Last name"
                  placeholderTextColor={colorTheme.placeholder}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              style={styles.inputField}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor={colorTheme.placeholder}
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
              style={styles.inputField}
              placeholder="Password"
              placeholderTextColor={colorTheme.placeholder}
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="none"
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              style={styles.inputField}
              placeholder="Confirm Password"
              placeholderTextColor={colorTheme.placeholder}
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="none"
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
        )}

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              style={styles.inputField}
              placeholder="Phone"
              keyboardType="phone-pad"
              placeholderTextColor={colorTheme.placeholder}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone.message}</Text>
        )}
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              style={styles.inputField}
              placeholder="Nationality"
              placeholderTextColor={colorTheme.placeholder}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.country && (
          <Text style={styles.errorText}>{errors.country.message}</Text>
        )}
        <Spacer height={12} />
        <View>
          {submitError && <Text style={styles.errorText}>{submitError}</Text>}
          <ThemedButton onPress={handleSubmit(onSubmit)}>
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
    </View>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorTheme.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 40,
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
