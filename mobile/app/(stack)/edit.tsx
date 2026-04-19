import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { lightColors, darkColors } from "@/constants/colors";
import COLORS from "../../constants/colors";
import { useEffect, useState } from "react";
import { API } from "../../lib/api";
import { Animated } from "react-native";
import { useRef } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfile() {

  //const [loading, setLoading] = useState(false);

  // ✅ Use replace instead of back() to avoid flicker
  const handleBack = () => {
    router.replace("/(tabs)/profile");
  };


  type UserType = {
    username: string;
    email: string;
    profileImage?: string;
    hostel?: string;
    phone?: string;
    };
  
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
    useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile");
        setUser(res.data);
      } catch (err) {
        console.log("Profile error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);
  
    if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.loadingImage}
            resizeMode="contain"
          />
  
          <Text style={styles.loadingText}>
            Loading your profile...
          </Text>
        </Animated.View>
      </View>
    );
  }
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: COLORS.background }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: user?.profileImage || "https://api.dicebear.com/7.x/avataaars/png?seed=sreekar",
              }}
              style={[styles.avatar, { borderColor: COLORS.primary }]}
            />
            <TouchableOpacity
              style={[styles.cameraBtn, { backgroundColor: COLORS.primary }]}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.changePhotoText, { color: COLORS.primary }]}>
            Change Photo
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: COLORS.textPrimary }]}>
            Username
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: COLORS.inputBackground,
                borderColor: COLORS.border,
                color: COLORS.textPrimary,
              },
            ]}
            placeholder="Enter Username"
            placeholderTextColor={COLORS.placeholderText}
            defaultValue={user?.username || "User"}
          />

          <Text style={[styles.label, { color: COLORS.textPrimary }]}>
            Email ID
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.disabledInput,
              {
                backgroundColor: COLORS.inputBackground,
                borderColor: COLORS.border,
                color: COLORS.placeholderText,
              },
            ]}
            value={user?.email || ""}
            editable={false}
          />
          <Text style={[styles.hint, { color: COLORS.placeholderText }]}>
            Email cannot be changed
          </Text>

          <Text style={[styles.label, { color: COLORS.textPrimary }]}>
            Phone
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: COLORS.inputBackground,
                borderColor: COLORS.border,
                color: COLORS.textPrimary,
              },
            ]}
            placeholder="Enter phone number"
            placeholderTextColor={COLORS.placeholderText}
            defaultValue={user?.phone || "Phone number"}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: COLORS.textPrimary }]}>
            Hostel
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: COLORS.inputBackground,
                borderColor: COLORS.border,
                color: COLORS.textPrimary,
              },
            ]}
            placeholder="Enter hostel"
            defaultValue={user?.hostel || "Hostel"}
            placeholderTextColor={COLORS.placeholderText}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                // ✅ Go back smoothly after saving
                router.replace("/(tabs)/profile");
              }, 1000);
            }}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 55,
    paddingBottom: 24,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 18,
    top: 55,
    padding: 4,
  },
  themeToggle: {
    position: "absolute",
    right: 18,
    top: 55,
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 4,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    padding: 7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
  },
  form: {
    padding: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 4,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 6,
    borderWidth: 1,
    fontSize: 15,
  },
  disabledInput: {
    opacity: 0.65,
  },
  hint: {
    fontSize: 11,
    marginBottom: 14,
    marginLeft: 4,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

    loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  
  loadingImage: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});