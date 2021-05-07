const express = require("express")
const orderRouter = express.Router();
const orderController = require("../controllers/orderController");
const cardCodeController = require("../controllers/cardCodeController")
const userController = require("../controllers/userController")

orderRouter.get("/",orderController.getOrder);
orderRouter.get("/:id",orderController.getOrderByOrderId);
orderRouter.get("/user/:id",userController.protect,orderController.getOrderByUserId);
orderRouter.post("/",orderController.placeOrder,cardCodeController.editCardCodeStatus);

module.exports = orderRouter;