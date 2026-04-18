import { View, StyleSheet } from "react-native";
import COLORS from "../constants/colors";

export default function BlobBackground() {
  return (
    <>
      <View style={styles.topBlob} />
      <View style={styles.topBlobAccent} />
      <View style={styles.bottomBlob} />
      <View style={styles.bottomBlobAccent} />
    </>
  );
}

const styles = StyleSheet.create({
  topBlob: {
    position: "absolute", top: -90, right: -70,
    width: 240, height: 240,
    backgroundColor: COLORS.primary,
    borderRadius: 150, opacity: 0.95, zIndex: 1,
  },
  topBlobAccent: {
    position: "absolute", top: -30, right: 60,
    width: 160, height: 160,
    borderWidth: 2.5, borderColor: "#d6bfa3",
    borderRadius: 100, backgroundColor: "transparent",
    opacity: 0.7, zIndex: 2,
  },
  bottomBlob: {
    position: "absolute", bottom: -110, left: -90,
    width: 280, height: 280,
    backgroundColor: COLORS.primary,
    borderRadius: 170, opacity: 0.95, zIndex: 1,
  },
  bottomBlobAccent: {
    position: "absolute", bottom: -20, left: 60,
    width: 160, height: 160,
    borderWidth: 2.5, borderColor: "#D6BFA3",
    borderRadius: 100, backgroundColor: "transparent",
    opacity: 0.7, zIndex: 2,
  },
});