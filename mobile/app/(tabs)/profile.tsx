import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import COLORS from "../../constants/colors";
import { useEffect, useState } from "react";
import { API } from "../../lib/api";
import { Animated } from "react-native";
import { useRef } from "react";

export default function Profile() {

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
          uri: user?.profileImage || "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.avatar}
        />


        <Text style={styles.name}>{user?.username || "User"}</Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
      </View>

      {/* Menu Section */}
      <View style={styles.menuContainer}>
        
        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/edit")}
        >
          <Ionicons name="person-outline" size={22} color={COLORS.primary} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    marginTop:10,
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  email: {
    fontSize: 14,
    color: "#eee",
    marginTop: 4,
  },

  menuContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
    gap: 15,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },

  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
  },

  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#ff4d4d",
    margin: 20,
    padding: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  logoutText: {
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