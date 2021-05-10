const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");

userRouter.get("/user", userController.protect, userController.getUser);
userRouter.get("/user-all", userController.getAllUser);
userRouter.get("/user/:id", userController.getUserById);
userRouter.patch(
  "/user/:id",
  userController.protect,
  userController.updateUser
);
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);

module.exports = userRouter;
