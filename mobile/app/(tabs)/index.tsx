import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

const { width } = Dimensions.get("window");

interface DiningHall {
  id: number;
  name: string;
  percentage: number; // 0 - 100
  status: "Low" | "Moderate" | "Busy";
}

export default function Dashboard() {
  const router = useRouter();
  const [diningHalls, setDiningHalls] = useState<DiningHall[]>([
    { id: 1, name: "Main Mess", percentage: 32, status: "Moderate" },
    { id: 2, name: "North Mess", percentage: 78, status: "Busy" },
    { id: 3, name: "South Mess", percentage: 15, status: "Low" },
    { id: 4, name: "Cafe / Quick Bite", percentage: 55, status: "Moderate" },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to get color and status text
  const getStatusInfo = (percentage: number) => {
    if (percentage < 30) return { color: "#22c55e", text: "Low Crowd" };
    if (percentage < 70) return { color: "#eab308", text: "Moderate" };
    return { color: "#ef4444", text: "Busy" };
  };

  // Pull-to-refresh (for demo)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate network delay
    setTimeout(() => {
      // For now we just re-randomize a bit to show dynamic feel
      setDiningHalls((prev) =>
        prev.map((hall) => ({
          ...hall,
          percentage: Math.max(5, Math.min(95, hall.percentage + (Math.random() * 20 - 10))),
        }))
      );
      setRefreshing(false);
    }, 1200);
  }, []);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good evening, Sreekar 👋</Text>
          <Text style={styles.title}>Live Dining Status</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* 4 Cards in 2x2 Grid */}
      <View style={styles.grid}>
        {diningHalls.map((hall) => {
          const { color, text } = getStatusInfo(hall.percentage);

          return (
            <View key={hall.id} style={styles.card}>
              {/* Hall Name + Icon */}
              <View style={styles.cardHeader}>
                <Ionicons name="restaurant-outline" size={28} color={COLORS.primary} />
                <Text style={styles.hallName}>{hall.name}</Text>
              </View>

              {/* Status Text */}
              <Text style={[styles.statusText, { color }]}>
                {text}
              </Text>

              {/* Dynamic Status Bar (Progress) */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${hall.percentage}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              {/* Percentage */}
              <Text style={styles.percentageText}>
                {hall.percentage.toFixed(2)}%
              </Text>
              {/* Small hint for future */}
              <View style={styles.peopleRow}>
                  <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.peopleHint}>
                    {( (hall.percentage / 100) * 420 ).toFixed(2)} inside
                  </Text>
                </View>
            </View>
          );
        })}
      </View>

      {/* Footer note */}
      <Text style={styles.note}>
        Data updates automatically every 30 seconds{'\n'}
        (Connected to real-time crowd sensors in future)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  refreshBtn: {
    padding: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
    marginTop:50
  },
  card: {
    width: (width - 68) / 2, // 2 cards per row with gap
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  hallName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  progressContainer: {
    height: 10,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 999,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "right",
  },
  peopleHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "right",
  },
  note: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  peopleRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 6,
},

});