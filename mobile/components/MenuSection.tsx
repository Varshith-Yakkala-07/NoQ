import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

export interface MenuItem {
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snacks";
  isVeg: boolean;
}

interface MenuSectionProps {
  menu: MenuItem[];
  loading?: boolean;
  date?: string; // display string like "Wednesday, 22 January"
}

const MEAL_TABS = ["breakfast", "lunch", "dinner", "snacks"] as const;
type MealTab = typeof MEAL_TABS[number];

const MEAL_ICONS: Record<MealTab, string> = {
  breakfast: "sunny-outline",
  lunch: "restaurant-outline",
  dinner: "moon-outline",
  snacks: "cafe-outline",
};

function autoSelectMeal(): MealTab {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 18) return "snacks";
  return "dinner";
}

export default function MenuSection({ menu, loading = false, date }: MenuSectionProps) {
  const [activeTab, setActiveTab] = useState<MealTab>(autoSelectMeal);

  const filtered = menu.filter((item) => item.category === activeTab);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Today's Menu</Text>
        {date && <Text style={styles.date}>{date}</Text>}
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        style={styles.tabsScroll}
      >
        {MEAL_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = menu.filter((m) => m.category === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={MEAL_ICONS[tab] as any}
                size={14}
                color={isActive ? "#fff" : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {count > 0 && (
                <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isActive && styles.countTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Items List */}
      {loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="hourglass-outline" size={28} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Loading menu...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="clipboard-outline" size={28} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No items for this meal</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((item, i) => (
            <View
              key={i}
              style={[styles.item, i === filtered.length - 1 && styles.itemLast]}
            >
              {/* Veg/Non-veg box indicator */}
              <View style={[styles.vegBox, { borderColor: item.isVeg ? "#22c55e" : "#ef4444" }]}>
                <View style={[styles.vegInner, { backgroundColor: item.isVeg ? "#22c55e" : "#ef4444" }]} />
              </View>

              <Text style={styles.itemName}>{item.name}</Text>

              <Text style={[styles.vegLabel, { color: item.isVeg ? "#22c55e" : "#ef4444" }]}>
                {item.isVeg ? "Veg" : "Non-Veg"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  date: { fontSize: 11, color: COLORS.textSecondary },

  tabsScroll: { marginBottom: 14 },
  tabsRow: { flexDirection: "row", gap: 8 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  tabTextActive: { color: "#fff" },

  countBadge: {
    backgroundColor: COLORS.border,
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  countBadgeActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  countText: { fontSize: 9, fontWeight: "700", color: COLORS.textSecondary },
  countTextActive: { color: "#fff" },

  list: {},
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  itemLast: { borderBottomWidth: 0 },

  vegBox: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  vegInner: { width: 6, height: 6, borderRadius: 99 },

  itemName: { flex: 1, fontSize: 14, fontWeight: "500", color: COLORS.textPrimary },
  vegLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },

  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  emptyText: { fontSize: 13, color: COLORS.textSecondary },
});