const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrder,
  UpdateOrder,
  deleteOrder,
} = require("../controlers/orderControllers");
const { isAuthenticated, authorizeRoles } = require("../middleware/Auth");

router.route("/order/new").post(isAuthenticated,newOrder);
router.route("/order/:id").get(isAuthenticated,getSingleOrder);
router.route("/orders/me").get(isAuthenticated,myOrders);

router.route("/admin/orders").get(isAuthenticated,authorizeRoles("admin"),getAllOrder);
router.route("/admin/orders/:id").put(isAuthenticated,authorizeRoles("admin"),UpdateOrder);
router.route("/admin/orders/:id").delete(isAuthenticated,authorizeRoles("admin"),deleteOrder);

module.exports = router;
