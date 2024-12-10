const express = require("express");
const { registerUser, loginUser, logout, forgetPassword ,resetPassword, getUserDeatils, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser } = require ("../controlers/userControllers");
const router = express.Router();
const {isAuthenticated,authorizeRoles} = require("../middleware/Auth");

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticated,getUserDeatils);
router.route("/password/update").put(isAuthenticated,updatePassword);
router.route("/me/updates").put(isAuthenticated,updateProfile);

router.route("/admin/users").get(isAuthenticated,authorizeRoles("admin"),getAllUser);
router.route("/admin/user/:id").get(isAuthenticated,authorizeRoles("admin"),getSingleUser)
.put(isAuthenticated,authorizeRoles("admin"),updateUserRole)
.delete(isAuthenticated,authorizeRoles("admin"),deleteUser);

module.exports = router;
