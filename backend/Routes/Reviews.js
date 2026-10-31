const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const allowTo = require("../middleware/allowTo");
const {
  getAllProductReviews,
  updateProductReview,
  deleteProductReview,
} = require("../Controllers/ReviewControllers");
const {
  validateReviewId,
  validateReviewList,
  validateReviewBody,
} = require("../middleware/review.validate");

const router = express.Router();

router
  .route("/")
  .get(verifyToken, allowTo, validateReviewList, getAllProductReviews);
router
  .route("/:id")
  .put(verifyToken, validateReviewId, validateReviewBody, updateProductReview)
  .delete(verifyToken, allowTo, validateReviewId, deleteProductReview);

module.exports = router;
