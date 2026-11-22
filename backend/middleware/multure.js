const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");
const cloudinary = require("cloudinary").v2;
const { deleteStoredImage, isCloudinaryConfigured } = require("../utilites/imageStorage");

const cloudinaryStorage = (name) => ({
  _handleFile(req, file, callback) {
    const safeName = path
      .parse(file.originalname)
      .name.replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .slice(0, 40);
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: `toty-fashion/${name}`,
        public_id: `${Date.now()}-${randomUUID()}-${safeName || "image"}`,
        resource_type: "image",
        allowed_formats: ["jpg", "png", "webp"],
      },
      (error, result) => {
        if (error) {
          callback(error);
          return;
        }

        callback(null, {
          filename: result.public_id,
          path: result.secure_url,
          cloudinaryUrl: result.secure_url,
        });
      },
    );
    file.stream.pipe(upload);
  },
  _removeFile(req, file, callback) {
    deleteStoredImage(file.cloudinaryUrl)
      .then(() => callback(null))
      .catch(callback);
  },
});

const unavailableStorage = {
  _handleFile(req, file, callback) {
    const error = new Error(
      "Image storage is not configured. Set CLOUDINARY_URL in the backend environment.",
    );
    error.statusCode = 503;
    callback(error);
  },
  _removeFile(req, file, callback) {
    callback(null);
  },
};

function uploader(name) {
  const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../images"));
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
      const safeName = path
        .parse(file.originalname)
        .name.replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .slice(0, 40);
      const imageName = `${name}-${Date.now()}-${safeName || "image"}${extension}`;
      cb(null, imageName);
    },
  });
  const storage = isCloudinaryConfigured()
    ? cloudinaryStorage(name)
    : process.env.VERCEL
      ? unavailableStorage
      : localStorage;

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
        cb(null, true);
        return;
      }

      cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
    },
  });
}

module.exports = { uploader };
