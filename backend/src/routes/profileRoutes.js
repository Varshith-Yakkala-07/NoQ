import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req,res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Not a valid user");
        res.status(500).json({message : "User not found"});
    }
});

export default router;