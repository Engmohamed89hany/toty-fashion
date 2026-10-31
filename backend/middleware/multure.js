const multer = require("multer");
const path = require("path");

function uploader(name) {
  const storage = multer.diskStorage({
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
