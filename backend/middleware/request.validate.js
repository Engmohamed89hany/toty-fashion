const { param, query } = require("express-validator");
const validate = require("./validate");

const validatePositiveId = (name = "id") => [
  param(name)
    .isInt({ min: 1, max: 2147483647 })
    .withMessage(`Please provide a valid ${name}`),
  validate,
];

const validatePagination = (maximumLimit = 100) => [
  query("page")
    .optional()
    .isInt({
      min: 1,
      max: Math.floor(Number.MAX_SAFE_INTEGER / maximumLimit),
    })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: maximumLimit })
    .withMessage(`limit must be an integer between 1 and ${maximumLimit}`),
];

const validateSearch = (maximumLength = 255) =>
  query("search")
    .optional()
    .isString()
    .withMessage("search must be a string")
    .bail()
    .trim()
    .isLength({ max: maximumLength })
    .withMessage(`search must not exceed ${maximumLength} characters`);

module.exports = {
  validatePositiveId,
  validatePagination,
  validateSearch,
  validate,
};
