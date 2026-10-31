const { body, param } = require("express-validator");
const validate = require("./validate");
const {
  validatePagination,
  validateSearch,
} = require("./request.validate");
const registerValidator = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isString()
    .withMessage("Please provide a valid email")
    .bail()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Phone number must be a string")
    .bail()
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage("Please provide a valid 11-digit phone number"),
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Address must not exceed 255 characters"),
  validate,
];
const loginValidator = [
  body("email")
    .isString()
    .withMessage("Please provide a valid email")
    .bail()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validate,
];
const validateUserId = [
  param("id")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Please provide a valid user ID"),
  validate,
];
const validateUpdateRole = [
  body("userId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Please provide a valid user ID"),
  body("newRole")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
  validate,
];
const validateUserList = [
  ...validatePagination(100),
  validateSearch(100),
  validate,
];
const validateUpdateUser = [
  param("id")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Please provide a valid user ID"),
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isString()
    .withMessage("Please provide a valid email")
    .bail()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("phone")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Phone number must be a string")
    .bail()
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage("Please provide a valid 11-digit phone number"),
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Address must not exceed 255 characters"),
  body("role")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
  validate,
];
const validateRefreshTokenBody = [
  body("refreshToken")
    .optional()
    .isString()
    .withMessage("refreshToken must be a string")
    .bail()
    .isLength({ min: 1, max: 8192 })
    .withMessage("refreshToken must not exceed 8192 characters"),
  validate,
];
module.exports = {
  registerValidator,
  loginValidator,
  validateUserId,
  validateUserList,
  validateUpdateRole,
  validateUpdateUser,
  validateRefreshTokenBody,
};
