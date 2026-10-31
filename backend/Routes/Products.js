const express = require("express");
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
const Router = express.Router();
Router.route("/:id/reviews")
  .get(getProductReviews)
  .post(verifyToken, createProductReview);
Router.route("/:id/reviews/:reviewId").put(verifyToken, updateProductReview);
Router.route("/")
  .get(getAllProducts)
  .post(
    verifyToken,
    allowTo,
    uploader("product").array("images", 5),
    createProduct,
  );
Router.route("/:id")
  .get(getProduct)
  .put(
    verifyToken,
    allowTo,
    uploader("product").array("images", 5),
    updateProduct,
  )
  .delete(verifyToken, allowTo, deleteProduct);
module.exports = Router;
