const express = require("express");
const uploadImageRouter = express.Router();
const uploadImageController = require("../controllers/uploadImageController");
const multer = require("../middlewares/multer");

uploadImageRouter.post(
  "/payment",
  multer.send,
  uploadImageController.uploadPayment
);
uploadImageRouter.post(
  "/product",
  multer.send,
  uploadImageController.uploadProduct
);

module.exports = uploadImageRouter;
