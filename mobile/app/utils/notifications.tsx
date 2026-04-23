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
    projectId: "f7c3e46c-b2b7-4e21-81dc-d5b5e277e527",
  });

  
  const token = tokenData.data;
  console.log("Push Token:", token);

  // Send to backend
  await axios.post("https://noq-1.onrender.com/api/dh/register-token", {
    token,
  });

  return token;
}