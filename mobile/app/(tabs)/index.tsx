import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import COLORS from "../../constants/colors";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications } from "../utils/notifications";

const { width } = Dimensions.get("window");

interface DiningHall {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  capacity: number;
  count: number;
  status: "Low" | "Moderate" | "Busy";
}

const getStatusInfo = (percentage: number) => {
  if (percentage <= 20)
    return { color: "#22c55e", text: "Low", icon: "checkmark-circle-outline" as const };

  if (percentage <= 40)
    return { color: "#f59e0b", text: "Moderate", icon: "time-outline" as const };

  return { color: "#ef4444", text: "Busy", icon: "warning-outline" as const };
};

export default function Dashboard() {
  const router = useRouter();

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // ✅ FIX 1: Moved inside the component (was outside before — caused crash)
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const transformData = (data: any[] = []): DiningHall[] => {
    if (!Array.isArray(data)) return [];

    return data
      .filter((hall) => hall && typeof hall === "object")
      .map((hall, index) => {
        const count = Number(hall?.count ?? 0);
        const zone = hall?.zone ?? `DH${index + 1}`;

        const percentage = (count / 15) * 100;

        let status: "Low" | "Moderate" | "Busy" = "Low";
        if (percentage > 40) status = "Busy";
        else if (percentage > 20) status = "Moderate";

        return {
          id: `dh${index + 1}`,
          name: zone,
          shortName: `DH${index + 1}`,
          percentage,
          capacity: 15,
          count,
          status,
        };
      });
  };

  const fetchData = async () => {
    try {
      const res = await axios.get("https://noq-1.onrender.com/api/dh/all");

      const data = res?.data;

      if (!data) return;

      let rawData: any[] = [];

      if (Array.isArray(data)) {
        rawData = data;
      } else if (typeof data === "object") {
        rawData = Object.values(data);
      }

      setDiningHalls(transformData(rawData));
    } catch (err) {
      console.log("API error ignored:", err);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
      setCountdown(5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const handleCardPress = (hall: DiningHall) => {
    router.push({
      pathname: "/dh/[id]",
      params: {
        id: hall.id,
        data: JSON.stringify(hall),
      },
    });
  };

  const avgLoad =
    diningHalls.length > 0
      ? Math.round(
          diningHalls.reduce((a, b) => a + b.percentage, 0) /
            diningHalls.length
        )
      : 0;

  const busyCount = diningHalls.filter((h) => h.percentage > 40).length;

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", margin: 20 }}>
          Dining Status
        </Text>

        {diningHalls.map((hall) => {
          const { color, text, icon } = getStatusInfo(hall.percentage);

          return (
            <TouchableOpacity
              key={hall.id}
              onPress={() => handleCardPress(hall)}
              style={styles.card}
            >
              <Text style={{ fontSize: 18, fontWeight: "600" }}>
                {hall.shortName}
              </Text>

              <Text style={{ color }}>{text}</Text>

              <Text>
                {hall.count}/15 ({Math.round(hall.percentage)}%)
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 56) / 2;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Decorative circles matching login page
  circleTopRight: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primary,
    top: -80,
    right: -80,
    zIndex: 0,
  },
  circleTopRightInner: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: COLORS.primary + "30",
    top: -20,
    right: 60,
    zIndex: 0,
  },
  circleBottomLeft: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary + "15",
    bottom: 40,
    left: -60,
    zIndex: 0,
  },

  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, zIndex: 1 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  titleHighlight: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ef444415",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ef4444",
    letterSpacing: 1,
  },

  // Logo
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    marginTop: -10,
    overflow: "hidden",
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  // Stats Banner
  statsBanner: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Grid & Cards
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dhBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dhBadgeText: { fontSize: 13, fontWeight: "700" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  statusText: { fontSize: 13, fontWeight: "600" },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: { height: "100%", borderRadius: 999 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  percentText: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  peopleRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  peopleText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "500" },

  // Footer
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 28,
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});