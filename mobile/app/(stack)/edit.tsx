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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import COLORS from "../../constants/colors";
import { useEffect, useState } from "react";
import { API } from "../../lib/api";
import { Animated } from "react-native";
import { useRef } from "react";

type UserType = {
  username: string;
  email: string;
  profileImage?: string;
  hostel?: string;
  phone?: string;
};

export default function EditProfile() {
  const [user, setUser] = useState<UserType | null>(null);

  // form states (IMPORTANT: do NOT bind directly to user)
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [hostel, setHostel] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const handleBack = () => {
    router.replace("/(tabs)/profile");
  };

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
        const data = res.data;

        setUser(data);

        // initialize form values
        setUsername(data.username || "");
        setPhone(data.phone || "");
        setHostel(data.hostel || "");
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    const cleanUsername = username.trim();
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanPassword = password.trim();

    // validations
    if (cleanUsername.length < 3) {
      return Alert.alert("Error", "Username must be at least 3 characters");
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
  return Alert.alert("Error", "Enter valid Indian phone number");
}

    if (cleanPassword && cleanPassword.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters");
    }

    // build payload (ONLY send required fields)
    const updateData: any = {
      username: cleanUsername,
      phone: cleanPhone,
      hostel: hostel || user?.hostel,
    };

    // only send password if user entered it
    if (cleanPassword.length > 0) {
      updateData.password = cleanPassword;
    }

    try {
      setSaving(true);

      await API.put("/profile/update", updateData);

      Alert.alert("Success", "Profile updated");

      router.replace("/(tabs)/profile");
    } catch (err: any) {
      console.log(err?.response?.data || err);
      Alert.alert("Error", "Update failed");
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.loadingText}>Loading profile...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Image
            source={{
              uri:
                user?.profileImage ||
                "https://api.dicebear.com/7.x/avataaars/png",
            }}
            style={styles.avatar}
          />
        </View>

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        {/* Email (readonly) */}
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.inputDisabled} value={user?.email} editable={false} />

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* Hostel Dropdown (simple alert-based) */}
        <Text style={styles.label}>Hostel</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() =>
            Alert.alert("Select Hostel", "", [
              { text: "Dia Hostel", onPress: () => setHostel("Dia Hostel") },
              { text: "College Hostel", onPress: () => setHostel("College Hostel") },
              { text: "Cancel", style: "cancel" },
            ])
          }
        >
          <Text>{hostel || "Select Hostel"}</Text>
        </TouchableOpacity>

        {/* Password */}
        <Text style={styles.label}>Change Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="New password (optional)"
        />

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, marginLeft: 12 },

  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },

  label: { fontWeight: "600", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  inputDisabled: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    opacity: 0.6,
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    marginTop: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingImage: { width: 120, height: 120 },
  loadingText: { marginTop: 10 },
});