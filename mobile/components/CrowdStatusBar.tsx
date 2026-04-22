import { View, Text, StyleSheet } from "react-native";
import COLORS from "../constants/colors";

interface CrowdStatusBarProps {
  percentage: number;
  height?: number;
  showLabels?: boolean;
  showPercent?: boolean;
}

export function getStatusColor(percentage: number) {
  if (percentage < 30) return "#22c55e";
  if (percentage < 70) return "#f59e0b";
  return "#ef4444";
}

export function getStatusLabel(percentage: number): "Low" | "Moderate" | "Busy" {
  if (percentage < 30) return "Low";
  if (percentage < 70) return "Moderate";
  return "Busy";
}

export default function CrowdStatusBar({
  percentage,
  height = 8,
  showLabels = false,
  showPercent = false,
}: CrowdStatusBarProps) {
  const color = getStatusColor(percentage);
  const label = getStatusLabel(percentage);

  return (
    <View style={styles.wrapper}>
      {/* Labels row above bar */}
      {showLabels && (
        <View style={styles.labelsRow}>
          <Text style={styles.labelLeft}>Crowd Level</Text>
          <View style={[styles.badge, { backgroundColor: color + "20", borderColor: color + "50" }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
          </View>
        </View>
      )}

      {/* Track */}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, percentage))}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
        {/* Tick marks at 30% and 70% */}
        <View style={[styles.tick, { left: "30%" }]} />
        <View style={[styles.tick, { left: "70%" }]} />
      </View>

      {/* Percentage below */}
      {showPercent && (
        <View style={styles.percentRow}>
          <Text style={styles.percentText}>0%</Text>
          <Text style={[styles.percentCurrent, { color }]}>{Math.round(percentage)}% full</Text>
          <Text style={styles.percentText}>100%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },

  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelLeft: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 99 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  track: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 999,
    overflow: "visible",
    position: "relative",
  },
  fill: {
    borderRadius: 999,
    position: "absolute",
    left: 0,
    top: 0,
  },
  tick: {
    position: "absolute",
    top: "50%",
    width: 1,
    height: "120%",
    backgroundColor: COLORS.border,
    transform: [{ translateY: -4 }],
    zIndex: 2,
  },

  percentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  percentText: { fontSize: 10, color: COLORS.textSecondary },
  percentCurrent: { fontSize: 12, fontWeight: "700" },
});