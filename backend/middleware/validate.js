const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const uploadedFiles = [
      ...(req.file ? [req.file] : []),
      ...(Array.isArray(req.files) ? req.files : []),
    ];
    for (const file of uploadedFiles) {
      fs.unlink(path.join(file.destination, file.filename), (error) => {
        if (error && error.code !== "ENOENT") {
          console.error("Error deleting rejected upload:", error);
        }
      });
    }

    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

module.exports = validate;