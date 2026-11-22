const { validationResult } = require("express-validator");
const { deleteUploadedFiles } = require("../utilites/imageStorage");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const uploadedFiles = [
      ...(req.file ? [req.file] : []),
      ...(Array.isArray(req.files) ? req.files : []),
    ];
    void deleteUploadedFiles(uploadedFiles, "rejected upload");

    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

module.exports = validate;