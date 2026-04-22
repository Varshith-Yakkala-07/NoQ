import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "../constants/colors";
import { getStatusColor, getStatusLabel } from "./CrowdStatusBar";

const { width } = Dimensions.get("window");
export const CARD_WIDTH = (width - 56) / 2;

export interface DiningHall {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  capacity: number;
}

interface DHCardProps {
  hall: DiningHall;
}

export default function DHCard({ hall }: DHCardProps) {
  const router = useRouter();
  const color = getStatusColor(hall.percentage);
  const label = getStatusLabel(hall.percentage);
  const inside = Math.round((hall.percentage / 100) * hall.capacity);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/dh/${hall.id}` as any)}
      activeOpacity={0.72}
    >
      {/* Top row: badge + arrow */}
      <View style={styles.cardTop}>
        <View style={[styles.dhBadge, { backgroundColor: color + "18" }]}>
          <Text style={[styles.dhBadgeText, { color }]}>{hall.shortName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={15} color={COLORS.textSecondary} />
      </View>

      {/* Status label with dot */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color }]}>{label}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, hall.percentage)}%`, backgroundColor: color },
          ]}
        />
      </View>

      {/* Bottom: % + people count */}
      <View style={styles.cardBottom}>
        <Text style={styles.percentText}>{Math.round(hall.percentage)}%</Text>
        <View style={styles.peopleRow}>
          <Ionicons name="people-outline" size={11} color={COLORS.textSecondary} />
          <Text style={styles.peopleText}>{inside}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  dhBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dhBadgeText: { fontSize: 13, fontWeight: "700" },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  statusDot: { width: 7, height: 7, borderRadius: 99 },
  statusText: { fontSize: 12, fontWeight: "600" },

  progressTrack: {
    height: 6,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: { height: "100%", borderRadius: 999 },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  percentText: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  peopleRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  peopleText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "500" },
});