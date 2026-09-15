import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (
  fileBuffer,
  folderName,
  resourceType = "auto",
  publicId = null,
) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: folderName,
      resource_type: resourceType,
      type: "upload",
    };

    if (publicId) {
      // For raw files, keep the extension
      if (resourceType === "raw") {
        options.public_id = publicId;
      } else {
        options.public_id = publicId.includes(".")
          ? publicId.split(".").slice(0, -1).join(".")
          : publicId;
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }

        console.log("Cloudinary Upload Success:", result.secure_url);

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    uploadStream.end(fileBuffer);
  });
};
