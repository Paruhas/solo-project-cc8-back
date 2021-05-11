const express = require("express");
const orderRouter = express.Router();
const orderController = require("../controllers/orderController");
const cardCodeController = require("../controllers/cardCodeController");
const userController = require("../controllers/userController");

orderRouter.get("/", userController.protectAdmin, orderController.getOrder);
orderRouter.get(
  "/:id",
  userController.protect,
  orderController.getOrderByOrderId
);
orderRouter.get(
  "/count/:id",
  userController.protect,
  orderController.getOrderByOrderIdCount
);
orderRouter.get(
  "/approve/:id",
  userController.protect,
  orderController.getOrderByOrderIdPaymentStatusAPPROVE
);
orderRouter.get(
  "/user/:id",
  userController.protect,
  orderController.getOrderByUserId
);
orderRouter.post(
  "/",
  userController.protect,
  orderController.placeOrder,
  cardCodeController.editCardCodeStatus
);
orderRouter.get(
  "/order-user/:id",
  userController.protect,
  orderController.getOrderByUserAndOrderId
); //

module.exports = orderRouter;
