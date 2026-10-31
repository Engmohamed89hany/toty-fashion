const express = require("express");
const { query } = require("express-validator");
const verifyToken = require("../middleware/verifyToken");
const allowTo = require("../middleware/allowTo");
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../Controllers/ProductControllers");
const {
  getProductReviews,
  createProductReview,
  updateProductReview,
} = require("../Controllers/ReviewControllers");
const { uploader } = require("../middleware/multure");
const {
  validatePositiveId,
  validatePagination,
  validateSearch,
  validate,
} = require("../middleware/request.validate");
const {
  validateProductId,
  validateProductReviewIds,
  validateProductReviewList,
  validateReviewBody,
} = require("../middleware/review.validate");
const Router = express.Router();
const validateProductList = [
  ...validatePagination(100),
  validateSearch(255),
  query("category_id")
    .optional()
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("category_id must be a positive integer"),
  validate,
];
Router.route("/:id/reviews")
  .get(validateProductId, validateProductReviewList, getProductReviews)
  .post(
    verifyToken,
    validateProductId,
    validateReviewBody,
    createProductReview,
  );
Router.route("/:id/reviews/:reviewId").put(
  verifyToken,
  validateProductReviewIds,
  validateReviewBody,
  updateProductReview,
);
Router.route("/")
  .get(validateProductList, getAllProducts)
  .post(
    verifyToken,
    allowTo,
    uploader("product").array("images", 5),
    createProduct,
  );
Router.route("/:id")
  .get(validatePositiveId(), getProduct)
  .put(
    verifyToken,
    allowTo,
    validatePositiveId(),
    uploader("product").array("images", 5),
    updateProduct,
  )
  .delete(verifyToken, allowTo, validatePositiveId(), deleteProduct);
module.exports = Router;
