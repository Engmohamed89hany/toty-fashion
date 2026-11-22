const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const imageDirectory = path.join(__dirname, "../images");

const isCloudinaryConfigured = () => {
  const config = cloudinary.config();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
};

const getImageReference = (file) =>
  file.cloudinaryUrl || `/images/${file.filename}`;

const getCloudinaryPublicId = (imageReference) => {
  if (typeof imageReference !== "string") {
    return null;
  }

  let imageUrl;
  try {
    imageUrl = new URL(imageReference);
  } catch {
    return null;
  }

  if (!imageUrl.hostname.endsWith(".cloudinary.com")) {
    return null;
  }

  const uploadPath = "/image/upload/";
  const uploadIndex = imageUrl.pathname.indexOf(uploadPath);
  if (uploadIndex === -1) {
    return null;
  }

  const publicId = imageUrl.pathname
    .slice(uploadIndex + uploadPath.length)
    .replace(/^v\d+\//, "")
    .replace(/\.[^/.]+$/, "");

  return publicId ? decodeURIComponent(publicId) : null;
};

const deleteStoredImage = async (imageReference) => {
  if (typeof imageReference !== "string" || !imageReference) {
    return;
  }

  const publicId = getCloudinaryPublicId(imageReference);
  if (publicId) {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    if (!["ok", "not found"].includes(result.result)) {
      throw new Error(`Cloudinary did not delete image: ${result.result}`);
    }
    return;
  }

  if (/^https?:\/\//i.test(imageReference)) {
    return;
  }

  const filename = path.basename(imageReference);
  try {
    await fs.promises.unlink(path.join(imageDirectory, filename));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const deleteUploadedFiles = (files, context = "uploaded image") =>
  Promise.all(
    files.map(async (file) => {
      try {
        await deleteStoredImage(file.cloudinaryUrl || file.filename);
      } catch (error) {
        console.error(`Error deleting ${context}:`, error);
      }
    }),
  );

module.exports = {
  deleteStoredImage,
  deleteUploadedFiles,
  getImageReference,
  isCloudinaryConfigured,
};
