const { body } = require("express-validator");
const {
  validatePositiveId,
  validatePagination,
  validateSearch,
  validate,
} = require("./request.validate");

const validateCategoryId = validatePositiveId();

const validateCategoryList = [
  ...validatePagination(100),
  validateSearch(255),
  validate,
];

const validateCreateCategory = [
  body("title")
    .isString()
    .withMessage("title is required")
    .bail()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("title must be between 1 and 255 characters"),
  body("description")
    .isString()
    .withMessage("description is required")
    .bail()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("description must be between 1 and 2000 characters"),
  validate,
];

const validateUpdateCategory = [
  body("title")
    .optional()
    .isString()
    .withMessage("title must be a string")
    .bail()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("title must be between 1 and 255 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string")
    .bail()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("description must be between 1 and 2000 characters"),
  body().custom((value, { req }) => {
    const hasCategoryField =
      value &&
      (Object.hasOwn(value, "title") ||
        Object.hasOwn(value, "description"));
    if (!hasCategoryField && !req.file) {
      throw new Error("Provide a title, description, or image to update");
    }
    return true;
  }),
  validate,
];

module.exports = {
  validateCategoryId,
  validateCategoryList,
  validateCreateCategory,
  validateUpdateCategory,
};
