import { View, Image, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import COLORS from "../constants/colors"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  userId: string;
  exp: number;
};

export default function Loading() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  

  useEffect(() => {
    // animation start
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          goToLogin();
          return;
        }

        let decoded: DecodedToken;

        try {
          decoded = jwtDecode<DecodedToken>(token);
        } catch (err) {
          // corrupted token
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          goToLogin();
          return;
        }

        const currentTime = Date.now() / 1000;

        if (!decoded?.exp || decoded.exp < currentTime) {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          goToLogin();
        } else {
          goToHome();
        }
      } catch (e) {
        goToLogin();
      }
    };

    const goToLogin = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/(auth)/login");
      });
    };

    const goToHome = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/(tabs)");
      });
    };

    const timer = setTimeout(checkAuth, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
  },
});