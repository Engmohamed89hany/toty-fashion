const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  registerUser,
  loginUser,
  updateRole,
  deleteUser,
  refresh,
  logoutUser,
  usersGroupByRole,
} = require("../Controllers/User.Controllers");
const verifyToken = require("../middleware/verifyToken");
const allowTo = require("../middleware/allowTo");
const { uploader } = require("../middleware/multure");
const {
  registerValidator,
  loginValidator,
  validateUserId,
  validateUpdateRole,
  validateUpdateUser,
} = require("../middleware/user.validate");
const router = express.Router();
const uploadUserImage = uploader("user").single("image");

router.route("/").get(verifyToken, allowTo, getAllUsers);
router.route("/update-role").put(verifyToken, allowTo, updateRole);
router.route("/register").post(uploadUserImage, registerValidator, registerUser);
router.route("/login").post(loginValidator, loginUser);
router.route("/logout").post(logoutUser);
router.route("/refresh").post(refresh);
router.route("/group-by-role").get(verifyToken, allowTo, usersGroupByRole);
router
  .route("/:id")
  .get(verifyToken, allowTo, getUserById)
  .put(verifyToken, allowTo, uploadUserImage, validateUpdateUser, updateUser)
  .delete(verifyToken, allowTo, deleteUser);
module.exports = router;
