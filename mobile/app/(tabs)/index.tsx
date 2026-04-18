import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "../../constants/colors";

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Good Morning, Sreekar 👋</Text>
        <Text style={styles.subtitle}>What are you looking for today?</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
          <Text style={styles.actionTitle}>Book Slot</Text>
          <Text style={styles.actionDesc}>Find available slots</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="time-outline" size={32} color={COLORS.primary} />
          <Text style={styles.actionTitle}>Live Queue</Text>
          <Text style={styles.actionDesc}>Check current wait time</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          <Text style={styles.noDataText}>No recent bookings yet</Text>
        </View>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <TouchableOpacity style={styles.serviceCard}>
          <Ionicons name="restaurant-outline" size={28} color={COLORS.primary} />
          <View>
            <Text style={styles.serviceTitle}>Restaurant Table Booking</Text>
            <Text style={styles.serviceDesc}>Reserve your table instantly</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceCard}>
          <Ionicons name="medkit-outline" size={28} color={COLORS.primary} />
          <View>
            <Text style={styles.serviceTitle}>Doctor Appointment</Text>
            <Text style={styles.serviceDesc}>Book with top specialists</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  actionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noDataText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontStyle: "italic",
    padding: 20,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  serviceDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});