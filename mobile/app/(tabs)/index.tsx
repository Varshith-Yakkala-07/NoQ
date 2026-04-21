import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import COLORS from "../../constants/colors";

const { width } = Dimensions.get("window");

interface DiningHall {
  id: number;
  name: string;
  percentage: number;
  status: "Low" | "Moderate" | "Busy";
  count: number;
  capacity: number;
}

export default function Dashboard() {
  const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 🔁 Transform backend → UI
  const transformData = (data: any[]): DiningHall[] => {
    return data.map((hall, index) => {
      const percentage = (hall.count / hall.capacity) * 100;

      let status: "Low" | "Moderate" | "Busy" = "Low";
      if (percentage >= 70) status = "Busy";
      else if (percentage >= 30) status = "Moderate";

      return {
        id: index + 1,
        name: hall.zone,
        percentage,
        status,
        count: hall.count,
        capacity: hall.capacity,
      };
    });
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "https://noq-1.onrender.com/api/dh/all"
      );

      const rawData = Object.values(res.data);
      setDiningHalls(transformData(rawData));

    } catch (err) {
      console.error("Error fetching crowd data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const getStatusInfo = (percentage: number) => {
    if (percentage < 30) return { color: "#22c55e", text: "Low Crowd" };
    if (percentage < 70) return { color: "#eab308", text: "Moderate" };
    return { color: "#ef4444", text: "Busy" };
  };

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
          <Text style={styles.greeting}>Live Status</Text>
          <Text style={styles.title}>Dining Hall Crowd</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {diningHalls.map((hall) => {
          const { color, text } = getStatusInfo(hall.percentage);

          return (
            <View key={hall.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="restaurant-outline" size={28} color={COLORS.primary} />
                <Text style={styles.hallName}>{hall.name}</Text>
              </View>

              <Text style={[styles.statusText, { color }]}>
                {text}
              </Text>

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

              <Text style={styles.percentageText}>
                {hall.percentage.toFixed(1)}%
              </Text>

              <View style={styles.peopleRow}>
                <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.peopleHint}>
                  {hall.count} / {hall.capacity}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.note}>
        Auto updates every 5 seconds
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