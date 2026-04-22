import express from "express";
import axios from "axios";

const router = express.Router();


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
    res.json(response.data);
  } catch (error) {
    console.error("Python-code API Error:", error.message);
    res.status(500).json({ error: "Python service failed" });
  }
});

export default router;