const express = require("express")
const paymentRouter = express.Router();
const paymentController = require("../controllers/paymentController");
const userController = require("../controllers/userController");

paymentRouter.get("/",paymentController.getAllPayment);
paymentRouter.get("/:id",paymentController.getPaymentById);
paymentRouter.patch("/upload/:id",paymentController.uploadPayment);
paymentRouter.patch("/approve",userController.protect,paymentController.approvePayment);
paymentRouter.patch("/cancel",userController.protect,paymentController.cancelPayment);

module.exports = paymentRouter;