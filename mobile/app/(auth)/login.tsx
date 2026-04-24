import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import BlobBackground from "../../components/BlobBackground";
import COLORS from "../../constants/colors";
import { red } from "react-native-reanimated/lib/typescript/Colors";
import { API } from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications } from "../utils/notifications";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateField = (
    field: "email" | "password",
    value: string
  ) => {
    const btRegex = /^bt[a-z0-9]{8}@iiitn\.ac\.in$/;

if (field === "email") {
  if (!value.trim()) {
    setErrors((prev) => ({
      ...prev,
      email: "Email is required",
    }));
  } else if (!btRegex.test(value.toLowerCase())) {
    setErrors((prev) => ({
      ...prev,
      email: "Use valid IIITN BT email",
    }));
  } else {
    setErrors((prev) => ({
      ...prev,
      email: "",
    }));
  }
}

    if (field === "password") {
      if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          password: "Password required",
        }));
      } else if (value.length < 6) {
        setErrors((prev) => ({
          ...prev,
          password: "Min 6 characters",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password: "",
        }));
      }
    }
  };

  const handleForgotPassword = async () => {
  const emailTrim = email.trim().toLowerCase();

  if (!emailTrim) {
    setErrors((prev) => ({
      ...prev,
      email: "Email is required",
    }));
    return;
  }

  const btRegex = /^bt[a-z0-9]{8}@iiitn\.ac\.in$/;

  if (!btRegex.test(emailTrim)) {
    setErrors((prev) => ({
      ...prev,
      email: "Use valid IIITN BT email",
    }));
    return;
  }

  setIsSendingOtp(true);

  try {
    await API.post("/auth/forgotpassword", {
      email: emailTrim,
    });

    router.push({
      pathname: "/(auth)/otp",
      params: {
        mode: "forgot",
        email: emailTrim,
      },
    });
  } catch (err: any) {
    let message = "Failed to send OTP";

  if (err.response) {
    // Server responded with error
    message =
      err.response.data?.message ||
      err.response.data ||
      message;
  } else if (err.request) {
    // Request made but no response
    message = "Server not reachable";
  } else {
    // Something else
    message = err.message;
  }

    setErrors({
      email: message,
      password: "",
    });
  } finally {
    setIsSendingOtp(false);
  }
};

  const handleLogin = async () => {
  let hasError = false;

  const newErrors = {
    email: "",
    password: "",
  };

  const emailTrim = email.trim().toLowerCase();
  const passwordTrim = password.trim();

  const btRegex = /^bt[a-z0-9]{8}@iiitn\.ac\.in$/;

if (!emailTrim) {
  newErrors.email = "Email is required";
  hasError = true;
} else if (!btRegex.test(emailTrim)) {
  newErrors.email = "Use valid IIITN BT email";
  hasError = true;
}

  if (!passwordTrim) {
    newErrors.password = "Password required";
    hasError = true;
  }

  setErrors(newErrors);
  if (hasError) return;

  setIsLoading(true);

  try {
    const res = await API.post("/auth/login", {
      email: emailTrim,
      password: passwordTrim,
    });

    const { token, user } = res.data;

    await AsyncStorage.setItem("token", token);
    await registerForPushNotifications();
    await AsyncStorage.setItem("user", JSON.stringify(user));

    router.replace("/(tabs)");

  } catch (err: any) {
    const message =
      err?.response?.data?.message || "Login failed";

    setErrors({
      email: "",
      password: message,
    });

  } finally {
    setIsLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.container}>
        {/* Fixed Blobs */}
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <BlobBackground />
        </View>

        <KeyboardAwareScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          enableOnAndroid={true}
          extraScrollHeight={40}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <Image
              source={require("../../assets/images/noq.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Login to your NoQ account
            </Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  errors.email &&
                    styles.inputError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                />

                <TextInput
                  style={styles.input}
                  placeholder="your@iiitn.ac.in"
                  placeholderTextColor={
                    COLORS.placeholderText
                  }
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    validateField(
                      "email",
                      text
                    );
                  }}
                />
              </View>

              {errors.email ? (
                <Text style={styles.errorText}>
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  errors.password &&
                    styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={
                    COLORS.placeholderText
                  }
                  secureTextEntry={
                    !showPassword
                  }
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    validateField(
                      "password",
                      text
                    );
                  }}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              {errors.password ? (
                <Text style={styles.errorText}>
                  {errors.password}
                </Text>
              ) : null}
            </View>
             <TouchableOpacity
  style={styles.forgotWrapper}
  onPress={handleForgotPassword}
  disabled={isSendingOtp}
>
  {isSendingOtp ? (
    <ActivityIndicator size="small" color={COLORS.primary} />
  ) : (
    <Text style={styles.forgotText}>
      Forgot Password?
    </Text>
  )}
</TouchableOpacity>
            {/* Login */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Login →
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text
                style={
                  styles.footerText
                }
              >
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/(auth)/signup"
                  )
                }
              >
                <Text
                  style={
                    styles.footerLink
                  }
                >
                  Signup
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  logoRow: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    width: 80,
    height: 80,
  },

  card: {
    backgroundColor:
      COLORS.cardBackground,
    borderRadius: 22,
    padding: 28,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    elevation: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color:
      COLORS.textPrimary,
  },

  subtitle: {
    textAlign: "center",
    color:
      COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontWeight: "600",
    marginBottom: 8,
    color:
      COLORS.textPrimary,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      COLORS.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 14,
    height: 52,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color:
      COLORS.textPrimary,
  },

  inputError: {
    borderColor:
      COLORS.error ||
      "#ef4444",
  },

  errorText: {
    color:
      COLORS.error ||
      "#ef4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },

  button: {
    backgroundColor:
      COLORS.primary,
    height: 52,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 22,
  },

  footerText: {
    color:
      COLORS.textSecondary,
  },

  footerLink: {
    color:
      COLORS.primary,
    fontWeight: "700",
  },
  // ADD THESE STYLES

forgotWrapper: {
  alignItems: "flex-end",
  marginTop: -4,
  marginBottom: 14,
},

forgotText: {
  color: COLORS.primary,
  fontWeight: "800",
  fontSize: 14,
},
});