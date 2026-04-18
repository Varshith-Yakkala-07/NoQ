// COMPLETE OTP.tsx FINAL CODE

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  useRouter,
  useLocalSearchParams,
} from "expo-router";

import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { API } from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BlobBackground from "../../components/BlobBackground";
import COLORS from "../../constants/colors";

export default function OTP() {
  const router = useRouter();



  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  const inputRefs = useRef<
    (TextInput | null)[]
  >([]);

  const handleOtpChange = (
    value: string,
    index: number
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyPress = (
    e: any,
    index: number
  ) => {
    if (
      e.nativeEvent.key ===
        "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  const {
  mode,
  email,
  username,
  password,
  hostel,
  phone,
} = useLocalSearchParams<any>();

const isSignup = mode === "register";

 const handleSubmit = async () => {
  const code = otp.join("");

  if (code.length !== 6) {
    return Alert.alert("Error", "Enter all 6 digits");
  }

  setIsLoading(true);

  try {
    let res;

    if (isSignup) {
      res = await API.post("/auth/register", {
        username,
        email,
        password,
        hostel,
        phone,
        otp: code,
      });

      Alert.alert("Success", "Account created!", [
        {
          text: "Login",
          onPress: () =>
            router.replace("/(auth)/login"),
        },
      ]);

    } else {
      res = await API.post("/auth/forgotpassword", {
        email,
        otp: code,
      });

      const { token, user } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      router.replace("/(tabs)");
    }

  } catch (err: any) {
    const message =
      err?.response?.data?.message || "OTP failed";

    Alert.alert("Error", message);
  } finally {
    setIsLoading(false);
  }
};


  const title = isSignup
    ? "Verify Your Email"
    : "Forgot Password";

  const subtitle = isSignup
    ? "We sent a code to"
    : "Enter OTP sent to";

  const buttonText = isSignup
    ? "Confirm & Create Account →"
    : "Verify & Continue →";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <View style={styles.container}>
        <BlobBackground />

        <View style={styles.card}>
          <View
            style={styles.iconCircle}
          >
            <Ionicons
              name="shield-checkmark"
              size={34}
              color={
                COLORS.primary
              }
            />
          </View>

          <Text style={styles.title}>
            {title}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {subtitle}
            {"\n"}

            <Text
              style={
                styles.email
              }
            >
              {email}
            </Text>
          </Text>

          <View style={styles.row}>
            {otp.map(
              (
                digit,
                index
              ) => (
                <TextInput
                  key={index}
                   ref={(ref) => {
                    (inputRefs.current[index] = ref)}}
                  style={[
                    styles.box,
                    digit &&
                      styles.boxFilled,
                  ]}
                  value={digit}
                  onChangeText={(
                    value
                  ) =>
                    handleOtpChange(
                      value,
                      index
                    )
                  }
                  onKeyPress={(
                    e
                  ) =>
                    handleKeyPress(
                      e,
                      index
                    )
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                />
              )
            )}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={
              handleSubmit
            }
            disabled={
              isLoading
            }
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                {buttonText}
              </Text>
            )}
          </TouchableOpacity>


          <TouchableOpacity
            style={
              styles.backBtn
            }
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={
                COLORS.textSecondary
              }
            />

            <Text
              style={
                styles.backText
              }
            >
              {" "}
              Change details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal: 24,
    },

    card: {
      width: "100%",
      backgroundColor:
        COLORS.cardBackground,
      borderRadius: 20,
      padding: 28,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
      alignItems:
        "center",
      elevation: 5,
      zIndex: 10,
    },

    iconCircle: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor:
        "#FFF0D6",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 16,
    },

    title: {
      fontSize: 22,
      fontWeight: "700",
      color:
        COLORS.textPrimary,
    },

    subtitle: {
      marginTop: 8,
      marginBottom: 26,
      textAlign: "center",
      color:
        COLORS.textSecondary,
      lineHeight: 22,
    },

    email: {
      color:
        COLORS.primary,
      fontWeight: "700",
    },

    row: {
      flexDirection:
        "row",
      gap: 10,
      marginBottom: 28,
    },

    box: {
      width: 46,
      height: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
      backgroundColor:
        COLORS.inputBackground,
      textAlign: "center",
      fontSize: 22,
      fontWeight: "700",
      color:
        COLORS.textPrimary,
    },

    boxFilled: {
      borderColor:
        COLORS.primary,
      backgroundColor:
        "#FFF0D6",
    },

    button: {
      width: "100%",
      height: 50,
      borderRadius: 30,
      backgroundColor:
        COLORS.primary,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },

    resendBtn: {
      marginTop: 18,
    },

    resendText: {
      color:
        COLORS.textSecondary,
    },

    resendLink: {
      color:
        COLORS.primary,
      fontWeight: "700",
    },

    backBtn: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 10,
    },

    backText: {
      color:
        COLORS.textSecondary,
      fontSize: 13,
    },
  });