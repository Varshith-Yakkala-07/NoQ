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
import { registerForPushNotifications } from "../utils/notifications"

const { width } = Dimensions.get("window");
const floatAnim = useRef(new Animated.Value(0)).current;

interface DiningHall {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  capacity: number;
  count: number;
  status: "Low" | "Moderate" | "Busy";
}

// ✅ STATUS (MATCH BACKEND)
const getStatusInfo = (percentage: number) => {
  if (percentage <= 20)
    return { color: "#22c55e", text: "Low", icon: "checkmark-circle-outline" as const };

  if (percentage <= 40)
    return { color: "#f59e0b", text: "Moderate", icon: "time-outline" as const };

  return { color: "#ef4444", text: "Busy", icon: "warning-outline" as const };
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,

    // ✅ ADD THESE TWO
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Dashboard() {
  const router = useRouter();

  const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
  registerForPushNotifications();
}, []);

useEffect(() => {
  const sub = Notifications.addNotificationReceivedListener((notif) => {
    console.log("Notification received:", notif);
  });

  return () => sub.remove();
}, []);

  // ✅ TRANSFORM BACKEND DATA
  const transformData = (data: any[]): DiningHall[] => {
    return data.map((hall, index) => {
      const percentage = hall.capacity
        ? (hall.count / 15) * 100
        : 0;

      let status: "Low" | "Moderate" | "Busy" = "Low";
      if (percentage > 40) status = "Busy";
      else if (percentage > 20) status = "Moderate";

      return {
        id: `dh${index + 1}`,
        name: hall.zone,
        shortName: `DH${index + 1}`,
        percentage,
        capacity: 15,
        count: hall.count,
        status,
      };
    });
  };

  // ✅ FETCH DATA
  const fetchData = async () => {
    try {
      const res = await axios.get(
        "https://noq-1.onrender.com/api/dh/all"
      );

      const rawData = Object.values(res.data);
      setDiningHalls(transformData(rawData));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // ✅ ANIMATION
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ✅ AUTO REFRESH
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
      setCountdown(5);
    }, 5000);

    const countInterval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 5 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countInterval);
    };
  }, []);

  // ✅ MANUAL REFRESH
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => {
      setRefreshing(false);
      setCountdown(5);
    });
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

  // ✅ STATS
  const avgLoad =
    diningHalls.length > 0
      ? Math.round(
          diningHalls.reduce((a, b) => a + b.percentage, 0) /
            diningHalls.length
        )
      : 0;

  const busyCount = diningHalls.filter((h) => h.percentage > 40).length;

  useEffect(() => {
  const float = Animated.loop(
    Animated.sequence([
      Animated.timing(floatAnim, {
        toValue: -4,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ])
  );

  float.start();

  return () => float.stop();
}, []);

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.circleTopRight} />
      <View style={styles.circleTopRightInner} />
      <View style={styles.circleBottomLeft} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Live Status</Text>

            <View style={styles.titleRow}>
              <View style={styles.titleHighlight}>
                <Text style={styles.title}>Dining Status</Text>
              </View>

              <View style={styles.liveContainer}>
                <Animated.View
                  style={[styles.liveDot, { opacity: pulseAnim }]}
                />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          </View>

          <Animated.View
  style={[
    styles.logoContainer,
    { transform: [{ translateY: floatAnim }] },
  ]}
><Image
              source={require("../../assets/images/noq.png")}
              style={styles.logo}
              resizeMode="contain"
            /></Animated.View>
            
         
        </View>

        {/* STATS */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{avgLoad}%</Text>
            <Text style={styles.statLabel}>Avg Load</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text
              style={[
                styles.statValue,
                { color: busyCount > 0 ? "#ef4444" : "#22c55e" },
              ]}
            >
              {busyCount}
            </Text>
            <Text style={styles.statLabel}>Busy Now</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{diningHalls.length}</Text>
            <Text style={styles.statLabel}>Total DH</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All Dining Halls</Text>

        {/* GRID */}
        <View style={styles.grid}>
          {diningHalls.map((hall) => {
            const { color, text, icon } = getStatusInfo(hall.percentage);

            return (
              <TouchableOpacity
                key={hall.id}
                style={styles.card}
                onPress={() => handleCardPress(hall)}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <View
                    style={[styles.dhBadge, { backgroundColor: color + "20" }]}
                  >
                    <Text style={[styles.dhBadgeText, { color }]}>
                      {hall.shortName}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.statusRow}>
                  <Ionicons name={icon} size={14} color={color} />
                  <Text style={[styles.statusText, { color }]}>{text}</Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${hall.percentage}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>

                <View style={styles.cardBottom}>
  {/* 🔥 PEOPLE COUNT = PRIMARY */}
  <View style={styles.peopleRow}>
    <Ionicons
      name="people-outline"
      size={14}
      color={COLORS.textPrimary}
    />
    <Text style={styles.percentText}>
      {hall.count} / {hall.capacity}
    </Text>
  </View>

  {/* 📉 PERCENTAGE = SECONDARY */}
  <Text style={styles.peopleText}>
    {Math.round(hall.percentage)}%
  </Text>
</View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FOOTER */}
        <View style={styles.footerRow}>
          <Ionicons
            name="sync-outline"
            size={13}
            color={COLORS.textSecondary}
          />
          <Text style={styles.footerNote}>
            Auto-updates in {countdown}s
          </Text>
        </View>
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

  // 🔥 Premium border (soft glass feel)
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.06)",

  // 🔥 Depth (iOS + Android)
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 6,

  // 🔥 Floating effect
  marginTop: -10,

  // 🔥 Prevent overflow glitches
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