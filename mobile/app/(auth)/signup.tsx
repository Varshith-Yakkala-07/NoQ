import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { API } from "../../lib/api";

import BlobBackground from "../../components/BlobBackground";
import COLORS from "../../constants/colors";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hostel, setHostel] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    hostel: "",
    password: "",
  });

  const validateField = (
    field:
      | "name"
      | "email"
      | "phone"
      | "hostel"
      | "password",
    value: string
  ) => {
    if (field === "name") {
      setErrors((prev) => ({
        ...prev,
        name: !value.trim()
          ? "Name required"
          : "",
      }));
    }

    if (field === "email") {
      if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          email: "Email required",
        }));
      } else if (
        !value
          .toLowerCase()
          .endsWith("@iiitn.ac.in")
      ) {
        setErrors((prev) => ({
          ...prev,
          email:
            "Use @iiitn.ac.in email",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "",
        }));
      }
    }

    if (field === "phone") {
      const cleaned =
        value.replace(/\D/g, "");

      if (!cleaned) {
        setErrors((prev) => ({
          ...prev,
          phone:
            "Phone required",
        }));
      } else if (
        cleaned.length !== 10
      ) {
        setErrors((prev) => ({
          ...prev,
          phone:
            "Enter valid number",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          phone: "",
        }));
      }
    }

    if (field === "hostel") {
      setErrors((prev) => ({
        ...prev,
        hostel: !value
          ? "Select hostel"
          : "",
      }));
    }

    if (field === "password") {
      if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          password:
            "Password required",
        }));
      } else if (
        value.length < 6
      ) {
        setErrors((prev) => ({
          ...prev,
          password:
            "Min 6 chars",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password: "",
        }));
      }
    }
  };

  const handleVerify =
    async () => {
      let hasError = false;

      const newErrors = {
        name: "",
        email: "",
        phone: "",
        hostel: "",
        password: "",
      };

      if (!name.trim()) {
        newErrors.name =
          "Name required";
        hasError = true;
      }

      const btRegex = /^bt[a-z0-9]{8}@iiitn\.ac\.in$/;

if (!email.trim()) {
  newErrors.email = "Email required";
  hasError = true;
} else if (!btRegex.test(email.toLowerCase())) {
  newErrors.email = "Use valid IIITN BT email";
  hasError = true;
}

      if (
        phone.replace(/\D/g, "")
          .length !== 10
      ) {
        newErrors.phone =
          "Enter valid phone";
        hasError = true;
      }

      if (!hostel) {
        newErrors.hostel =
          "Select hostel";
        hasError = true;
      }

      if (
        password.length < 6
      ) {
        newErrors.password =
          "Min 6 chars";
        hasError = true;
      }

      setErrors(newErrors);

      if (hasError) return;

      setIsLoading(true);


      try {

        console.log("Sending request...");

    const res = await API.post("/auth/register", {
      username: name,
      email : email.trim().toLowerCase(),
      password,
      hostel,
      phone,
    });

    console.log("Response:", res.data);

 router.push({
      pathname: "/(auth)/otp",
      params: {
        mode: "register",
        username: name,
        email,
        password,
        hostel,
        phone,
      },
    });
     } catch (err: any) {
    const message =
      err?.response?.data?.message || "Signup failed";
      console.log("ERROR FULL:", err);
    console.log("ERROR RESPONSE:", err?.response?.data);

    alert(message);
      } finally {
        console.log("Finished request");
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
        {/* Fixed blobs */}
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
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={60}
          showsVerticalScrollIndicator={
            false
          }
        >
          <View style={styles.card}>
            <Text style={styles.title}>
              Create Account
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Join NoQ with your
              IIITN email
            </Text>

            {/* Username */}
            <View
              style={
                styles.inputGroup
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Username
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  errors.name &&
                    styles.inputError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    COLORS.primary
                  }
                />

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="Your Username"
                  value={name}
                  onChangeText={(
                    text
                  ) => {
                    setName(
                      text
                    );
                    validateField(
                      "name",
                      text
                    );
                  }}
                />
              </View>

              {errors.name ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {
                    errors.name
                  }
                </Text>
              ) : null}
            </View>

            {/* Email */}
            <View
              style={
                styles.inputGroup
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Email ID
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
                  color={
                    COLORS.primary
                  }
                />

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="yourname@iiitn.ac.in"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(
                    text
                  ) => {
                    setEmail(
                      text
                    );
                    validateField(
                      "email",
                      text
                    );
                  }}
                />
              </View>

              <Text
                style={
                  styles.hint
                }
              >
                Only iiitn email
                accepted
              </Text>

              {errors.email ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {
                    errors.email
                  }
                </Text>
              ) : null}
            </View>

            {/* Phone */}
            <View
              style={
                styles.inputGroup
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Phone Number
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  errors.phone &&
                    styles.inputError,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={
                    COLORS.primary
                  }
                />

                <Text
                  style={
                    styles.code
                  }
                >
                  +91
                </Text>

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(
                    text
                  ) => {
                    const onlyNum =
                      text.replace(
                        /\D/g,
                        ""
                      );

                    setPhone(
                      onlyNum
                    );

                    validateField(
                      "phone",
                      onlyNum
                    );
                  }}
                />
              </View>

              {errors.phone ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {
                    errors.phone
                  }
                </Text>
              ) : null}
            </View>

            {/* Hostel */}
            <View
              style={
                styles.inputGroup
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Hostel
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  errors.hostel &&
                    styles.inputError,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={
                    COLORS.primary
                  }
                />

                <Picker
                  selectedValue={
                    hostel
                  }
                  style={
                    styles.picker
                  }
                  dropdownIconColor={
                    COLORS.primary
                  }
                  onValueChange={(
                    itemValue
                  ) => {
                    setHostel(
                      itemValue
                    );
                    validateField(
                      "hostel",
                      itemValue
                    );
                  }}
                >
                  <Picker.Item
                    label="Select Hostel"
                    value=""
                  />
                  <Picker.Item
                    label="Dia Hostel"
                    value="Dia Hostel"
                  />
                  <Picker.Item
                    label="College Hostel"
                    value="College Hostel"
                  />
                </Picker>
              </View>

              {errors.hostel ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {
                    errors.hostel
                  }
                </Text>
              ) : null}
            </View>

            {/* Password */}
            <View
              style={
                styles.inputGroup
              }
            >
              <Text
                style={
                  styles.label
                }
              >
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
                  color={
                    COLORS.primary
                  }
                />

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="Create password"
                  secureTextEntry={
                    !showPassword
                  }
                  value={password}
                  onChangeText={(
                    text
                  ) => {
                    setPassword(
                      text
                    );
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
                    color={
                      COLORS.primary
                    }
                  />
                </TouchableOpacity>
              </View>

              {errors.password ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {
                    errors.password
                  }
                </Text>
              ) : null}
            </View>

            {/* Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={
                handleVerify
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
                  Verify Email →
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View
              style={
                styles.footer
              }
            >
              <Text
                style={
                  styles.footerText
                }
              >
                Already have an
                account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.back()
                }
              >
                <Text
                  style={
                    styles.footerLink
                  }
                >
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
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
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 70,
      paddingBottom: 35,
      justifyContent:
        "flex-start",
    },

    card: {
      backgroundColor:
        COLORS.cardBackground,
      borderRadius: 22,
      padding: 26,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
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
      marginTop: 6,
      marginBottom: 24,
      color:
        COLORS.textSecondary,
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
      minHeight: 52,
    },

    input: {
      flex: 1,
      marginLeft: 10,
      color:
        COLORS.textPrimary,
    },

    picker: {
      flex: 1,
      marginLeft: 10,
      color: COLORS.textPrimary,
      fontSize: 16,
    },

    code: {
      marginLeft: 10,
      fontWeight: "600",
      color:
        COLORS.textPrimary,
    },

    hint: {
      marginTop: 6,
      fontSize: 12,
      color:
        COLORS.primary,
    },

    inputError: {
      borderColor:
        COLORS.error ||
        "#ef4444",
    },

    errorText: {
      marginTop: 6,
      fontSize: 12,
      color:
        COLORS.error ||
        "#ef4444",
    },

    button: {
      marginTop: 8,
      backgroundColor:
        COLORS.primary,
      height: 52,
      borderRadius: 30,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },

    footer: {
      flexDirection:
        "row",
      justifyContent:
        "center",
      gap: 5,
      marginTop: 22,
      marginBottom: 5,
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
  });