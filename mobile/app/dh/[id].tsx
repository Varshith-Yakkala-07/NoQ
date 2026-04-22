import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import COLORS from "../../constants/colors";
import CrowdStatusBar from "../../components/CrowdStatusBar";
import MenuSection, { MenuItem } from "../../components/MenuSection";

// 🔽 ADD THIS ABOVE YOUR COMPONENT (after imports)
type Category = "breakfast" | "lunch" | "snacks" | "dinner";
const WEEKLY_MENU = {
  monday: {
    breakfast: ["Sabhudana"],
    lunch: ["Mixed Kathol"],
    snacks: ["Pakoda"],
    dinner: ["Methi Mutter"],
  },
  tuesday: {
    breakfast: ["Upma"],
    lunch: ["Chana"],
    snacks: ["Maggi"],
    dinner: ["Mixed Veg"],
  },
  wednesday: {
    breakfast: ["Uttappam"],
    lunch: ["Kadhi Pakodi"],
    snacks: ["Pani Puri"],
    dinner: ["Palak Paneer"],
  },
  thursday: {
    breakfast: ["Poha"],
    lunch: ["Soya"],
    snacks: ["Poha"],
    dinner: ["Chana Fry"],
  },
  friday: {
    breakfast: ["Wada"],
    lunch: ["Lobiya"],
    snacks: ["Vada Pav"],
    dinner: ["Sev"],
  },
  saturday: {
    breakfast: ["Aloo Paratha"],
    lunch: ["Veg Biryani"],
    snacks: ["Sandwich"],
    dinner: ["Aloo Curry"],
  },
  sunday: {
    breakfast: ["Masala Dosa"],
    lunch: ["Chana"],
    snacks: ["Cream Rolls"],
    dinner: ["Paneer Butter Masala"],
  },
};

const MEAL_TIMINGS = {
  breakfast: "7:30 AM – 10:00 AM",
  lunch: "12:00 PM – 2:30 PM",
  snacks: "5:30 PM – 6:15 PM",
  dinner: "7:30 PM – 10:00 PM",
};

function getCurrentMeal(): Category {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute;

  if (time >= 450 && time <= 600) return "breakfast";
  if (time >= 720 && time <= 870) return "lunch";
  if (time >= 1050 && time <= 1095) return "snacks";
  if (time >= 1170 && time <= 1320) return "dinner";

  return "breakfast";
}


function getTodayMenu() {
  const day = new Date()
    .toLocaleDateString("en-IN", { weekday: "long" })
    .toLowerCase();

  const todayMenu = WEEKLY_MENU[day as keyof typeof WEEKLY_MENU];

  if (!todayMenu) return [];

  return Object.entries(todayMenu).map(([category, items]) => ({
    category: category as Category,
    items,
  }));
}

interface DHDetail {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  capacity: number;
  count: number;
  location: string;
  timings: string;
  menu: MenuItem[];
}

// ✅ STATIC DATA
const DH_DETAILS: Record<string, Omit<DHDetail, "percentage" | "count">> = {
  dh1: {
    id: "dh1",
    name: "Dining Hall 1",
    shortName: "DH1",
    capacity: 20,
    location: "Hostel Block-A, Ground Floor",
    timings: "7:30 AM – 10:00 PM",
    menu: [],
  },
  dh2: {
    id: "dh2",
    name: "Dining Hall 2",
    shortName: "DH2",
    capacity: 20,
    location: "Hostel Block-A, Ground Floor",
    timings: "7:30 AM – 10:00 PM",
    menu: [],
  },
  dh3: {
    id: "dh3",
    name: "Dining Hall 3",
    shortName: "DH3",
    capacity: 20,
    location: "Hostel Block-A, Ground Floor",
    timings: "7:30 AM – 10:00 PM",
    menu: [],
  },
  dh4: {
    id: "dh4",
    name: "Dining Hall 4",
    shortName: "DH4",
    capacity: 20,
    location: "Hostel Block-A, Ground Floor",
    timings: "7:30 AM – 10:00 PM",
    menu: [],
  },
};

function getStatusColor(p: number) {
  if (p < 35) return "#22c55e";
  if (p < 65) return "#f59e0b";
  return "#ef4444";
}

function getStatusLabel(p: number) {
  if (p < 35) return "Low Crowd";
  if (p < 65) return "Moderate";
  return "Busy";
}

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function DHDetail() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const router = useRouter();
  const [selectedMeal, setSelectedMeal] = useState<Category>(() =>
  getCurrentMeal()
);

  const staticData = DH_DETAILS[id as string];

  // ✅ INITIAL DATA (fast render)
  const [dynamicData, setDynamicData] = useState<{
    count: number;
    percentage: number;
  } | null>(data ? JSON.parse(data) : null);

  // ✅ FETCH FUNCTION
  const fetchDHData = async () => {
    try {
      const res = await axios.get(
        `https://noq-1.onrender.com/api/dh/${id}`
      );

      /*const raw = Object.values(res.data);
      const index = parseInt(id.replace("dh", "")) - 1;*/
      const hall = res.data;

      if (!hall) return;

      const percentage = hall.capacity
        ? (hall.count / hall.capacity) * 100
        : 0;

      setDynamicData({
        count: hall.count,
        percentage,
      });
    } catch (err) {
      console.error("Detail fetch error:", err);
    }
  };

  // ✅ AUTO REFRESH
  /*useEffect(() => {
    fetchDHData();
    const interval = setInterval(fetchDHData, 5000);
    return () => clearInterval(interval);
  }, []);*/

  useEffect(() => {
  fetchDHData();
  const interval = setInterval(fetchDHData, 5000);
  return () => clearInterval(interval);
}, [id]);

useEffect(() => {
  const interval = setInterval(() => {
    setSelectedMeal(getCurrentMeal());
  }, 60000);

  return () => clearInterval(interval);
}, []);

  if (!staticData) {
    return (
      <View style={styles.errorState}>
        <Text style={{ color: COLORS.textPrimary }}>
          Dining hall not found.
        </Text>
      </View>
    );
  }

  const dh: DHDetail = {
    ...staticData,
    capacity : 20,
    ...(dynamicData || { count: 0, percentage: 0 }),
  };

  const color = getStatusColor(dh.percentage);
  const label = getStatusLabel(dh.percentage);

  const inside = dh.count;
  const avail = dh.capacity - inside;
  const todayMenu = getTodayMenu();
const currentMeal = todayMenu.find(
  (m) => m.category === selectedMeal
);



  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <RNStatusBar barStyle="dark-content" />

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>

      {/* Hero Card */}
      <View style={[styles.heroCard, { borderColor: color + "40" }]}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroShort}>{dh.shortName}</Text>
            <Text style={styles.heroName}>{dh.name}</Text>
          </View>

          <View
            style={[
              styles.pill,
              { backgroundColor: color + "18", borderColor: color + "40" },
            ]}
          >
            <View style={[styles.pillDot, { backgroundColor: color }]} />
            <Text style={[styles.pillText, { color }]}>{label}</Text>
          </View>
        </View>

        <CrowdStatusBar
          percentage={dh.percentage}
          height={12}
          showLabels={false}
          showPercent={true}
        />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="people" size={18} color={color} />
            <Text style={styles.statValue}>{inside}</Text>
            <Text style={styles.statLabel}>Inside</Text>
          </View>

          <View style={styles.vDivider} />

          <View style={styles.statBox}>
            <Ionicons
              name="person-add-outline"
              size={18}
              color="#22c55e"
            />
            <Text style={styles.statValue}>{avail}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>

          <View style={styles.vDivider} />

          <View style={styles.statBox}>
            <Ionicons
              name="people-circle-outline"
              size={18}
              color={COLORS.textSecondary}
            />
            <Text style={styles.statValue}>{dh.capacity}</Text>
            <Text style={styles.statLabel}>Capacity</Text>
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <InfoRow icon="location-outline" label="Location" value={dh.location} />
        <InfoRow icon="time-outline" label="Timings" value={dh.timings} />
        <InfoRow icon="calendar-outline" label="Today" value={today} last />
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
  <Text style={styles.menuTitle}>Today's Menu</Text>

  {/* Tabs */}
  <View style={styles.tabRow}>
    {(["breakfast", "lunch", "snacks", "dinner"] as Category[]).map(
      (meal) => (
        <TouchableOpacity
          key={meal}
          onPress={() => setSelectedMeal(meal)}
          style={[
            styles.tab,
            selectedMeal === meal && styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              selectedMeal === meal && styles.activeTabText,
            ]}
          >
            {meal}
          </Text>
        </TouchableOpacity>
      )
    )}
  </View>

  {/* Timings */}
  <Text style={styles.timings}>
    ⏰ {MEAL_TIMINGS[selectedMeal]}
  </Text>

  {/* Menu Items */}
  {currentMeal?.items.map((item, index) => (
    <Text key={index} style={styles.menuItem}>
      • {item}
    </Text>
  ))}
</View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, last }: any) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Ionicons name={icon} size={15} color={COLORS.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ✅ YOUR ORIGINAL STYLES (UNCHANGED)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 48, gap: 14 },
  errorState: { flex: 1, alignItems: "center", justifyContent: "center" },

  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
  },

  heroCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    gap: 16,
  },

  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  heroShort: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillDot: { width: 7, height: 7, borderRadius: 99 },
  pillText: { fontSize: 12, fontWeight: "700" },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statBox: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  vDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 13,
    alignItems: "flex-start",
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  menuCard: {
  backgroundColor: COLORS.cardBackground,
  padding: 16,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: COLORS.border,
  gap: 10,
},

menuTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: COLORS.textPrimary,
},

tabRow: {
  flexDirection: "row",
  gap: 8,
  marginTop: 6,
},

tab: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 12,
  backgroundColor: COLORS.inputBackground,
},

activeTab: {
  backgroundColor: "#22c55e20",
},

tabText: {
  fontSize: 12,
  color: COLORS.textSecondary,
  fontWeight: "600",
},

activeTabText: {
  color: "#22c55e",
},

timings: {
  fontSize: 12,
  fontWeight: "600",
  color: COLORS.textSecondary,
  marginTop: 4,
},

menuItem: {
  fontSize: 14,
  color: COLORS.textPrimary,
  marginTop: 4,
},
});