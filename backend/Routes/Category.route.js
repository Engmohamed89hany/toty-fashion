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
const {
  validateCategoryId,
  validateCategoryList,
  validateCreateCategory,
  validateUpdateCategory,
} = require("../middleware/category.validate");
router
  .route("/")
  .get(validateCategoryList, getAllCategories)
  .post(
    verifyToken,
    allowTo,
    uploader("category").single("image"),
    validateCreateCategory,
    createCategory,
  );
router
  .route("/:id")
  .get(validateCategoryId, getCategoryById)
  .put(
    verifyToken,
    allowTo,
    validateCategoryId,
    uploader("category").single("image"),
    validateUpdateCategory,
    updateCategory,
  )
  .delete(verifyToken, allowTo, validateCategoryId, deleteCategory);
module.exports = router;
