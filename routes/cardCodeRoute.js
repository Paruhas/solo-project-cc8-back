const express = require("express")
const cardCodeRouter = express.Router();
const cardCodeController = require("../controllers/cardCodeController");
const userController = require("../controllers/userController");

cardCodeRouter.get("/",cardCodeController.getAllCardCodes);
cardCodeRouter.get("/:pid",cardCodeController.getCardCodeByProductId);
cardCodeRouter.post("/:pid",userController.protect,cardCodeController.createCardCodeByProductId);
cardCodeRouter.patch("/",cardCodeController.editCardCodeStatus);

module.exports = cardCodeRouter;