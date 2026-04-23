import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", protect, async (req,res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Not a valid user, not allowed");
        res.status(500).json({message : "User not found"});
    }
});

router.put("/update", protect, upload.single("profileImage"), async (req,res) => {
    try {
        const {username, phone, hostel, password} = req.body;

        const user = await User.findById(req.user._id);

        if(!user) return res.status(404).json({message : "User not found"});

        if(username && username.trim().length >= 3) user.username = username.trim();
        if(phone) {
            const cleanPhone = phone.toString().replace(/\D/g, "");
            if (cleanPhone.length === 10) {
            user.phone = cleanPhone;
            }
        }
        if(hostel) user.hostel = hostel;

        if (password && password.trim()) {
    const newPass = password.trim();
    

    if (newPass.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters",
        });
    }

    user.password = newPass; // hashed in pre-save (good)
}


    // ✅ IMAGE UPLOAD PART
      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profiles" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(req.file.buffer);
        });


        const result = uploadResult;
        user.profileImage = result.secure_url;
      }

        await user.save();

    // NEVER return password
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        hostel: user.hostel,
        profileImage: user.profileImage,
      },
    });

    } catch (error) {
        console.log("error in edit profile pic");
        res.status(500).json({ message: "Internal server error" });
    }
})

export default router;