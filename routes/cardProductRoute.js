const express = require("express")
const cardProductRouter = express.Router();
const cardProductController = require("../controllers/cardProductController");
const userController = require("../controllers/userController");

// cardProductRouter.get("/",cardProductController.getAllCardProducts);
// cardProductRouter.get("/count",cardProductController.getAllCardProductsCount);
// cardProductRouter.get("/pending",cardProductController.getCardProductsPENDING);
// cardProductRouter.get("/sold",cardProductController.getCardProductsSOLD);
cardProductRouter.get("/not",cardProductController.getAllNotDeleteCardProducts);
cardProductRouter.get("/in-use",cardProductController.getAllAvailableCardProducts);
cardProductRouter.get("/in-use/:id",cardProductController.getAvailableCardProduct);
cardProductRouter.post("/",userController.protect,cardProductController.createCardProduct);
cardProductRouter.patch("/:id",userController.protect,cardProductController.editStatusCardProduct);

module.exports = cardProductRouter;