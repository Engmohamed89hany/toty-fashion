const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../Controllers/Category.Controllers");
const verifyToken = require("../middleware/verifyToken");
const allowTo = require("../middleware/allowTo");
const { uploader } = require("../middleware/multure");
console.log("uploader:", uploader); // Log the uploader function to check if it's defined
router
  .route("/")
  .get(getAllCategories)
  .post(
    verifyToken,
    allowTo,
    uploader("category").single("image"),
    createCategory,
  );
router
  .route("/:id")
  .get(getCategoryById)
  .put(
    verifyToken,
    allowTo,
    uploader("category").single("image"),
    updateCategory,
  )
  .delete(verifyToken, allowTo, deleteCategory);
module.exports = router;
