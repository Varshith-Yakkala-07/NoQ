import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import axios from "axios";

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log("Must use physical device");
    return;
  }

  // Ask permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Permission not granted");
    return;
  }

  // Get token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  
  const token = tokenData.data;
  console.log("Push Token:", token);

  // Send to backend
  await axios.post("https://noq-1.onrender.com/api/dh/register-token", {
    token,
  });

  return token;
}