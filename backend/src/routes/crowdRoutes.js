import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import Token from "../models/Token.js"

const router = express.Router();

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";



// store hall states
let hallTracker = {};


const PYTHON_URL = "https://smog-baboon-gloomily.ngrok-free.dev";

const NGROK_HEADERS = {
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
};

//  SINGLE API (optimized)
router.get("/all", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/all`, NGROK_HEADERS);

    const data = response.data;

    
   

    res.json(data);
  } catch (error) {
    console.log("error in backend - AI");
    console.error("Python API Error:", error.message);
    res.status(500).json({ error: "Python service failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${PYTHON_URL}/all`, NGROK_HEADERS);
    const data = response.data;

    // ✅ convert dh1 → hall1
    const hallKey = id.replace("dh", "hall");

    const hall = data[hallKey];

    if (!hall) {
      return res.status(404).json({ error: "DH not found" });
    }

    res.json(hall);
  } catch (error) {
    
    console.error("Python-code API Error:", error.message);
    res.status(500).json({ error: "Python service failed" });
  }
});

router.post("/register-token", async (req, res) => {
  const { token } = req.body;

  await Token.updateOne(
  { token },
  { token },
  { upsert: true }
);

console.log("Token saved in DB:", token);

  res.json({ success: true });
});

const sendNotification = async (title, body) => {
  try {
    const tokens = await Token.find();

const messages = tokens.map((t) => ({
  to: t.token,
  sound: "default",
  title,
  body,
}));

    await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Notification sent:", title);
  } catch (err) {
    console.error("Notification error raised:", err.message);
  }
};

const processDiningData = async (data) => {
  for (const key of Object.keys(data)) {
    const hall = data[key];
    const percentage = (hall.count / 15) * 100;

    let status = "LOW";
    if (percentage > 40) status = "BUSY";
    else if (percentage > 20) status = "MODERATE";

    if (!hallTracker[key]) {
      hallTracker[key] = {
        lastStatus: status,
        since: Date.now(),
        lastNotification: 0,
      };
      continue;
    }

    const tracker = hallTracker[key];

    if (tracker.lastStatus !== status) {
      tracker.lastStatus = status;
      tracker.since = Date.now();
      continue;
    }

    const duration = Date.now() - tracker.since;
    const cooldown = Date.now() - tracker.lastNotification;

    if (duration >= 60000 && cooldown >= 300000) {
      if (status === "LOW") {
        await sendNotification(
          `${key.toUpperCase()} is Free`,
          "Very less crowd now 🍽️"
        );
        tracker.lastNotification = Date.now();
      }

      if (status === "BUSY") {
        await sendNotification(
          `${key.toUpperCase()} is Crowded`,
          "Heavy rush right now ⚠️"
        );
        tracker.lastNotification = Date.now();
      }
    }
  }
};

const startBackgroundMonitoring = () => {
  setInterval(async () => {
    try {
      const response = await axios.get(`${PYTHON_URL}/all`, NGROK_HEADERS);
      const data = response.data;

      await processDiningData(data);
      console.log("Checked dining halls...");
    } catch (err) {
      console.log("background fetch error");
      console.error("Background fetch error:", err.message);
    }
  }, 10000); // every 10 seconds
};

startBackgroundMonitoring();

export default router;