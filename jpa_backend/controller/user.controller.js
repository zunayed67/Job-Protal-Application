import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudnaryUpload.js";

// ==========================================
// GET USER PROFILE
// ==========================================

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Get Profile Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// UPDATE USER PROFILE
// ==========================================

export const updateProfile = async (req, res) => {
  try {
    console.log("========== UPDATE PROFILE ==========");
    console.log("User ID:", req.user?.id);
    console.log("User Role:", req.user?.role);
    console.log("Body:", req.body);
    console.log("File:", req.file ? req.file.originalname : "No file");

    const { name, email, phone } = req.body;

    const updateData = {};

    // Update name
    if (name !== undefined && name.trim() !== "") {
      updateData.name = name.trim();
    }

    // Update email
    if (email !== undefined && email.trim() !== "") {
      updateData.email = email.trim().toLowerCase();
    }

    // Update phone
    if (phone !== undefined && phone.trim() !== "") {
      updateData.phone = phone.trim();
    }

    // ==========================================
    // RESUME UPLOAD
    // ==========================================

    if (req.file && req.user.role === "user") {
      const originalName = req.file.originalname;

      console.log("Uploading resume:", originalName);

      // Get extension
      const extension = originalName.split(".").pop().toLowerCase();

      // Remove extension from filename
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");

      // Sanitize filename
      const sanitizedBase = nameWithoutExt
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");

      const sanitizedFileName = `${sanitizedBase}.${extension}`;

      // Resume files are uploaded as raw files
      const resourceType = "raw";

      console.log("Sanitized filename:", sanitizedFileName);

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "jobportal/resume",
        resourceType,
        sanitizedFileName,
      );

      console.log("Cloudinary result:", uploadResult);

      if (!uploadResult) {
        throw new Error("Resume upload to Cloudinary failed");
      }

      updateData.resume = uploadResult.secure_url;
      updateData.resumePublicId = uploadResult.public_id;
    }

    // ==========================================
    // UPDATE DATABASE
    // ==========================================

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Profile updated successfully");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user,
    });
  } catch (err) {
    console.error("================================");
    console.error("UPDATE PROFILE ERROR:");
    console.error(err);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update profile",
    });
  }
};

// ==========================================
// GET PUBLIC ID FROM CLOUDINARY URL
// ==========================================

const getPublicIdFromUrl = (url, resourceType) => {
  try {
    const parts = url.split("/");

    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    // Skip "upload" and version number
    const pathAfterVersion = parts.slice(uploadIndex + 2).join("/");

    if (resourceType === "raw") {
      return pathAfterVersion;
    }

    // For image resources
    const lastDot = pathAfterVersion.lastIndexOf(".");

    if (lastDot === -1) {
      return pathAfterVersion;
    }

    return pathAfterVersion.substring(0, lastDot);
  } catch (error) {
    console.error("Get Public ID Error:", error.message);

    return null;
  }
};

// ==========================================
// GET USER RESUME
// ==========================================

export const getResume = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Resume is uploaded as raw
    const resourceType = user.resume.includes("/raw/") ? "raw" : "image";

    const publicId =
      user.resumePublicId || getPublicIdFromUrl(user.resume, resourceType);

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume reference",
      });
    }

    // ==========================================
    // RAW FILE
    // ==========================================

    if (resourceType === "raw") {
      const fileName = publicId.split("/").pop() || "resume.pdf";

      const format = fileName.includes(".")
        ? fileName.split(".").pop().toLowerCase()
        : "pdf";

      const signedUrl = cloudinary.utils.private_download_url(
        publicId,
        format,
        {
          resource_type: "raw",
          type: "upload",
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + 300,
        },
      );

      return res.redirect(signedUrl);
    }

    // ==========================================
    // IMAGE FILE
    // ==========================================

    const signedUrl = cloudinary.url(publicId, {
      resource_type: "image",
      type: "upload",
      secure: true,
      sign_url: true,
    });

    return res.redirect(signedUrl);
  } catch (err) {
    console.error("Resume Access Error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not access resume",
    });
  }
};
