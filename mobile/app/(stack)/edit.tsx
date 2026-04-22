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
import { useEffect, useState, useRef } from "react";
import { API } from "../../lib/api";
import { Animated } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AppLoader from "../../components/apploader";


type UserType = {
  username: string;
  email: string;
  profileImage?: string;
  hostel?: string;
  phone?: string;
};

export default function EditProfile() {
  const [user, setUser] = useState<UserType | null>(null);

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [hostel, setHostel] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const handleBack = () => {
    router.replace("/(tabs)/profile");
  };

  const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Allow gallery access");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
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

    // VALIDATIONS
    if (cleanUsername.length < 3) {
      return Alert.alert("Error", "Username must be at least 3 characters");
    }

    if (cleanPhone.length !== 10) {
      return Alert.alert("Error", "Phone number must be 10 digits");
    }

    if (cleanPassword && cleanPassword.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters");
    }

    const updateData: any = {
      username: cleanUsername,
      phone: cleanPhone,
      hostel: hostel || user?.hostel,
    };

    if (cleanPassword.length > 0) {
      updateData.password = cleanPassword;
    }

    try {
      setSaving(true);

      const formData = new FormData();

    formData.append("username", cleanUsername);
    formData.append("phone", cleanPhone);
    formData.append("hostel", (hostel || user?.hostel || ""));

    if (cleanPassword) {
      formData.append("password", cleanPassword);
    }

    if (image) {

      const fileName = image.split("/").pop() || "photo.jpg";
      const fileType = fileName.split(".").pop();
      formData.append("profileImage", {
        uri: image,
        name: fileName,
        type: `image/${fileType || "jpeg"}`,
      } as any);
    }

      await API.put("/profile/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    Alert.alert("Success", "Profile updated");
    router.replace("/(tabs)/profile");
  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Update failed!");
  } finally {
    setSaving(false);
  }
};

  
if (loading) {
  return <AppLoader />;
}

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: COLORS.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
  
  <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
    <Ionicons name="arrow-back" size={24} color="#fff" />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>Edit Profile</Text>

  <View style={{ width: 24 }} />
</View>

        {/* AVATAR */}
<View style={styles.avatarSection}>
  <View style={styles.avatarWrapper}>
    
    <Image
  source={{
    uri: image || user?.profileImage || "https://api.dicebear.com/7.x/avataaars/png",
  }}
  style={styles.avatar}
/>

    
    <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
      <Ionicons name="camera" size={18} color="#fff" />
    </TouchableOpacity>

  </View>
</View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>
  Email{" "}
  <Text style={styles.labelHint}>cannot be changed</Text>
</Text>
          <TextInput style={styles.inputDisabled} value={user?.email} editable={false} />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

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

          <Text style={styles.label}>Change Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="New password (optional)"
          />

          {/* SAVE */}
          <TouchableOpacity
  style={[styles.saveBtn, saving && { opacity: 0.7 }]}
  onPress={handleSave}
  disabled={saving}
>
  {saving ? (
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
  container: { flex: 1 },

  header: {
  paddingTop: 55,
  paddingBottom: 20,
  paddingHorizontal: 16,
  backgroundColor: COLORS.primary, // ✅ SAME AS PROFILE SCREEN
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
},
  backBtn: {
  position: "absolute",
  left: 16,
  top: 55, // matches your header paddingTop
  padding: 4,
},
labelHint: {
  fontSize: 11,
  color: "#9CA3AF",
  fontWeight: "400",
},

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  avatarSection: {
  alignItems: "center",
  marginTop: 24,
  marginBottom: 10,
},

avatarWrapper: {
  position: "relative",
  borderWidth: 3,
  borderColor: "#8B5A2B", // 👈 brown border
  borderRadius: 75,
  padding: 3,
},

avatar: {
  width: 110,
  height: 110,
  borderRadius: 55,
},

cameraBtn: {
  position: "absolute",
  bottom: 5,
  right: 5,
  backgroundColor: "#8B5A2B",
  padding: 7,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: "#fff",
  elevation: 4,
},

  form: {
    padding: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
  },

  inputDisabled: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    opacity: 0.6,
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    marginTop: 20,
    borderRadius: 16,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingImage: {
    width: 120,
    height: 120,
  },

  loadingText: {
    marginTop: 10,
  },
});