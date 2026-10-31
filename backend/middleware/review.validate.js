const { body } = require("express-validator");
const {
  validatePositiveId,
  validatePagination,
  validate,
} = require("./request.validate");

const validateProductId = validatePositiveId("id");
const validateReviewId = validatePositiveId();
const validateProductReviewIds = [
  validatePositiveId("id")[0],
  validatePositiveId("reviewId")[0],
  validate,
];
const validateProductReviewList = [...validatePagination(50), validate];
const validateReviewList = [...validatePagination(100), validate];
const validateReviewBody = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be an integer between 1 and 5"),
  body("comment")
    .isString()
    .withMessage("comment is required")
    .bail()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("comment must be between 10 and 2000 characters"),
  validate,
];

module.exports = {
  validateProductId,
  validateReviewId,
  validateProductReviewIds,
  validateProductReviewList,
  validateReviewList,
  validateReviewBody,
};
