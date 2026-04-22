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
    console.log("error in backend of ai");
    console.error("Python-code API Error:", error.message);
    res.status(500).json({ error: "Python service failed" });
  }
});

export default router;