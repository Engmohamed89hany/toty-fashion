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
  validateUserList,
  validateUpdateRole,
  validateUpdateUser,
  validateRefreshTokenBody,
} = require("../middleware/user.validate");
const router = express.Router();
const uploadUserImage = uploader("user").single("image");

router.route("/").get(verifyToken, allowTo, validateUserList, getAllUsers);
router
  .route("/update-role")
  .put(verifyToken, allowTo, validateUpdateRole, updateRole);
router.route("/register").post(uploadUserImage, registerValidator, registerUser);
router.route("/login").post(loginValidator, loginUser);
router.route("/logout").post(validateRefreshTokenBody, logoutUser);
router.route("/refresh").post(validateRefreshTokenBody, refresh);
router.route("/group-by-role").get(verifyToken, allowTo, usersGroupByRole);
router
  .route("/:id")
  .get(verifyToken, allowTo, validateUserId, getUserById)
  .put(verifyToken, allowTo, uploadUserImage, validateUpdateUser, updateUser)
  .delete(verifyToken, allowTo, validateUserId, deleteUser);
module.exports = router;
