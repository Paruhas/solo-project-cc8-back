const express = require("express");
const bankAccRouter = express.Router();
const bankAccController = require("../controllers/bankAccController");
const userController = require("../controllers/userController");

// bankAccRouter.get("/",bankAccController.getAllBankAccounts);
// bankAccRouter.get("/:id",bankAccController.getBankAccount);
bankAccRouter.get("/in-use", bankAccController.getAllAvailableBankAccounts);
bankAccRouter.get("/in-use/:id", bankAccController.getAvailableBankAccount);
bankAccRouter.post(
  "/",
  userController.protect,
  bankAccController.createBankAccount
);
bankAccRouter.patch(
  "/:id",
  userController.protect,
  bankAccController.editStatusBankAccount
);

module.exports = bankAccRouter;
