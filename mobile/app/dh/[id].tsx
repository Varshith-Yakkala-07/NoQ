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
import COLORS from "../../constants/colors";
import CrowdStatusBar from "../../components/CrowdStatusBar";
import MenuSection, { MenuItem } from "../../components/MenuSection";

interface DHDetail {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  capacity: number;
  location: string;
  timings: string;
  menu: MenuItem[];
}

const DH_DETAILS: Record<string, DHDetail> = {
  dh1: {
    id: "dh1", name: "Dining Hall 1", shortName: "DH1",
    percentage: 32, capacity: 420,
    location: "Block A, Ground Floor",
    timings: "7:30 AM – 9:30 PM",
    menu: [
      { name: "Idli Sambar",          category: "breakfast", isVeg: true  },
      { name: "Poha",                 category: "breakfast", isVeg: true  },
      { name: "Dal Rice",             category: "lunch",     isVeg: true  },
      { name: "Paneer Butter Masala", category: "lunch",     isVeg: true  },
      { name: "Chapati",              category: "lunch",     isVeg: true  },
      { name: "Chicken Curry",        category: "dinner",    isVeg: false },
      { name: "Jeera Rice",           category: "dinner",    isVeg: true  },
      { name: "Samosa",               category: "snacks",    isVeg: true  },
    ],
  },
  dh2: {
    id: "dh2", name: "Dining Hall 2", shortName: "DH2",
    percentage: 78, capacity: 380,
    location: "Block B, First Floor",
    timings: "7:00 AM – 10:00 PM",
    menu: [
      { name: "Puri Bhaji",   category: "breakfast", isVeg: true  },
      { name: "Upma",         category: "breakfast", isVeg: true  },
      { name: "Rajma Chawal", category: "lunch",     isVeg: true  },
      { name: "Mixed Veg",    category: "lunch",     isVeg: true  },
      { name: "Egg Curry",    category: "dinner",    isVeg: false },
      { name: "Fried Rice",   category: "dinner",    isVeg: true  },
      { name: "Bread Pakora", category: "snacks",    isVeg: true  },
    ],
  },
  dh3: {
    id: "dh3", name: "Dining Hall 3", shortName: "DH3",
    percentage: 15, capacity: 400,
    location: "Block C, Ground Floor",
    timings: "8:00 AM – 9:00 PM",
    menu: [
      { name: "Aloo Paratha",  category: "breakfast", isVeg: true  },
      { name: "Chole Bhature", category: "lunch",     isVeg: true  },
      { name: "Kadhi Pakora",  category: "lunch",     isVeg: true  },
      { name: "Roti Sabzi",    category: "dinner",    isVeg: true  },
      { name: "Mutton Curry",  category: "dinner",    isVeg: false },
      { name: "Tea & Biscuits",category: "snacks",    isVeg: true  },
    ],
  },
  dh4: {
    id: "dh4", name: "Dining Hall 4", shortName: "DH4",
    percentage: 55, capacity: 350,
    location: "Main Building, Basement",
    timings: "7:30 AM – 10:30 PM",
    menu: [
      { name: "Dosa & Chutney", category: "breakfast", isVeg: true  },
      { name: "Omelette",       category: "breakfast", isVeg: false },
      { name: "Veg Pulao",      category: "lunch",     isVeg: true  },
      { name: "Dal Tadka",      category: "lunch",     isVeg: true  },
      { name: "Fish Fry",       category: "dinner",    isVeg: false },
      { name: "Paneer Tikka",   category: "dinner",    isVeg: true  },
      { name: "Maggi",          category: "snacks",    isVeg: true  },
    ],
  },
};

function getStatusColor(p: number) {
  if (p < 30) return "#22c55e";
  if (p < 70) return "#f59e0b";
  return "#ef4444";
}
function getStatusLabel(p: number) {
  if (p < 30) return "Low Crowd";
  if (p < 70) return "Moderate";
  return "Busy";
}

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long",
});

export default function DHDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const dh = DH_DETAILS[id as string];
  if (!dh) {
    return (
      <View style={styles.errorState}>
        <Text style={{ color: COLORS.textPrimary }}>Dining hall not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary, marginTop: 8 }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const color  = getStatusColor(dh.percentage);
  const label  = getStatusLabel(dh.percentage);
  const inside = Math.round((dh.percentage / 100) * dh.capacity);
  const avail  = dh.capacity - inside;

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
          <View style={[styles.pill, { backgroundColor: color + "18", borderColor: color + "40" }]}>
            <View style={[styles.pillDot, { backgroundColor: color }]} />
            <Text style={[styles.pillText, { color }]}>{label}</Text>
          </View>
        </View>

        {/* Reusable CrowdStatusBar */}
        <CrowdStatusBar percentage={dh.percentage} height={12} showLabels showPercent />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="people" size={18} color={color} />
            <Text style={styles.statValue}>{inside}</Text>
            <Text style={styles.statLabel}>Inside</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statBox}>
            <Ionicons name="person-add-outline" size={18} color="#22c55e" />
            <Text style={styles.statValue}>{avail}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statBox}>
            <Ionicons name="people-circle-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.statValue}>{dh.capacity}</Text>
            <Text style={styles.statLabel}>Capacity</Text>
          </View>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <InfoRow icon="location-outline" label="Location" value={dh.location} />
        <InfoRow icon="time-outline"     label="Timings"  value={dh.timings} />
        <InfoRow icon="calendar-outline" label="Today"    value={today} last />
      </View>

      {/* Menu — reusable MenuSection */}
      <MenuSection menu={dh.menu} date={today} />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, last }: {
  icon: any; label: string; value: string; last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Ionicons name={icon} size={15} color={COLORS.textSecondary} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 48, gap: 14 },
  errorState:    { flex: 1, alignItems: "center", justifyContent: "center" },

  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
  },

  heroCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22, padding: 20, borderWidth: 1.5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4, gap: 16,
  },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  heroShort: {
    fontSize: 11, fontWeight: "600", color: COLORS.textSecondary,
    textTransform: "uppercase", letterSpacing: 1.2,
  },
  heroName: {
    fontSize: 24, fontWeight: "800",
    color: COLORS.textPrimary, letterSpacing: -0.5, marginTop: 2,
  },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  pillDot:  { width: 7, height: 7, borderRadius: 99 },
  pillText: { fontSize: 12, fontWeight: "700" },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  statBox:  { flex: 1, alignItems: "center", gap: 3 },
  statValue:{ fontSize: 20, fontWeight: "700", color: COLORS.textPrimary },
  statLabel:{ fontSize: 10, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  vDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18, paddingHorizontal: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoRow:       { flexDirection: "row", gap: 12, paddingVertical: 13, alignItems: "flex-start" },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel:     { fontSize: 10, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  infoValue:     { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
});