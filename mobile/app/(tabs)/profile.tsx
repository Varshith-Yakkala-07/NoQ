import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import COLORS from "../../constants/colors";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {

  // logout handler
  const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Do you really want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");

            router.replace("/(auth)/login");
          } catch (err) {
            console.log("Logout error:", err);
          }
        },
      },
    ]
  );
};


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>Sreekar Chowdary</Text>
        <Text style={styles.email}>sreekar@email.com</Text>
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
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
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
});