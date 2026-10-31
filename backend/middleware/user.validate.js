const { body, param } = require("express-validator");
const validate = require("./validate");
const registerValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .optional()
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number must be exactly 11 characters"),
  validate,
];
const loginValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validate,
];
const validateUserId = [
  param("id").isMongoId().withMessage("Please provide a valid user ID"),
  validate,
];
const validateUpdateRole = [
  body("userId").isMongoId().withMessage("Please provide a valid user ID"),
  body("newRole")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
  validate,
];
const validateUpdateUser = [
  param("id").isInt({ min: 1 }).withMessage("Please provide a valid user ID"),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("phone")
    .optional({ values: "falsy" })
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage("Please provide a valid 11-digit phone number"),
  body("address")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Address must not exceed 255 characters"),
  body("role")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
  validate,
];
module.exports = {
  registerValidator,
  loginValidator,
  validateUserId,
  validateUpdateRole,
  validateUpdateUser,
};
