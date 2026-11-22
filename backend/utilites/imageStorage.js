const fs = require("fs");
const os = require("os");
const path = require("path");

const imageDirectory = process.env.VERCEL
  ? path.join(os.tmpdir(), "toty-fashion", "images")
  : path.join(__dirname, "../images");
fs.mkdirSync(imageDirectory, { recursive: true });

const getImageReference = (file) => `/images/${file.filename}`;

const deleteStoredImage = async (imageReference) => {
  if (typeof imageReference !== "string" || !imageReference) {
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
        await deleteStoredImage(file.filename);
      } catch (error) {
        console.error(`Error deleting ${context}:`, error);
      }
    }),
  );

module.exports = {
  deleteStoredImage,
  deleteUploadedFiles,
  getImageDirectory: () => imageDirectory,
  getImageReference,
};
