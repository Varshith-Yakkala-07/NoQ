  import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import BlobBackground from "../components/BlobBackground";
import COLORS from "../constants/colors";

export default function Index() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Looping pulse animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.15,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const handleTap = () => {
    router.replace("/loading");
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <BlobBackground />

        <View style={styles.center}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>Skip the queue not the meal.</Text>

          {/* Pulse dot indicator */}
          <View style={styles.pulseWrapper}>
            {/* Outer ring pulse */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseOpacity,
                },
              ]}
            />
            {/* Inner solid dot */}
            <View style={styles.pulseDot} />
          </View>

          <Text style={styles.tapHint}>Tap anywhere to get started</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    zIndex: 10,
    paddingHorizontal: 30,
  },
  logo: {
    
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 32,
  },
  pulseWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  pulseRing: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
  },
  pulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
  tapHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
  },
});