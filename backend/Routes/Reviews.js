const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const allowTo = require("../middleware/allowTo");
const {
  getAllProductReviews,
  updateProductReview,
  deleteProductReview,
} = require("../Controllers/ReviewControllers");

const router = express.Router();

router
  .route("/")
  .get(verifyToken, allowTo, getAllProductReviews);
router
  .route("/:id")
  .put(verifyToken, updateProductReview)
  .delete(verifyToken, allowTo, deleteProductReview);

module.exports = router;
