const { CardProduct, CardCode, sequelize } = require("../models");
const AppError = require("../utils/AppError");

const isNumbers = /^\d*$/;

exports.getAllCardProducts = async (req, res, next) => {
  try {
    const allCardProducts = await CardProduct.findAll({
      include: [
        {
          model: CardCode,
          where: {
            // cardProductId: "1",
            // codeStatus: "AVAILABLE"
          },
        },
      ],
      where: {
        // isDeleted: "NOT"
      },
    });
    res.status(200).json({ allCardProducts });
  } catch (err) {
    next(err);
  }
};

exports.getAllCardProductsCount = async (req, res, next) => {
  try {
    const allCardProductsCount = await CardProduct.findAll({
      include: [
        {
          model: CardCode,
          where: {
            // cardProductId: "1",
            // codeStatus: "AVAILABLE"
          },
          attributes: [
            [sequelize.fn("COUNT", "CardCode.codeStatus"), "CardCodeAvailable"],
          ],
        },
      ],
      where: {
        isDeleted: "NOT",
      },
      group: ["card_product_id"],
    });
    res.status(200).json({ allCardProductsCount });
  } catch (err) {
    next(err);
  }
};

exports.getCardProductsPENDING = async (req, res, next) => {
  try {
    const PENDINGCardProducts = await CardProduct.findAll({
      include: [
        {
          model: CardCode,
          where: {
            // cardProductId: "1",
            codeStatus: "PENDING",
          },
        },
      ],
      where: {
        // isDeleted: "NOT"
      },
    });
    res.status(200).json({ PENDINGCardProducts });
  } catch (err) {
    next(err);
  }
};

exports.getCardProductsSOLD = async (req, res, next) => {
  try {
    const SOLDCardProducts = await CardProduct.findAll({
      include: [
        {
          model: CardCode,
          where: {
            // cardProductId: "1",
            codeStatus: "SOLD",
          },
        },
      ],
      where: {
        // isDeleted: "NOT"
      },
    });
    res.status(200).json({ SOLDCardProducts });
  } catch (err) {
    next(err);
  }
};

exports.getAllNotDeleteCardProducts = async (req, res, next) => {
  try {
    const notDeleteCardProducts = await CardProduct.findAll({
      // include: [
      //   {
      //     model: CardCode,
      //     where: {
      //       codeStatus: "AVAILABLE"
      //     }
      //   }
      // ],
      where: {
        isDeleted: "NOT",
      },
    });
    res.status(200).json({ notDeleteCardProducts });
  } catch (err) {
    next(err);
  }
};

exports.getAllAvailableCardProducts = async (req, res, next) => {
  try {
    const availableCardProducts = await CardProduct.findAll({
      include: [
        {
          model: CardCode,
          where: {
            codeStatus: "AVAILABLE",
          },
        },
      ],
      where: {
        isDeleted: "NOT",
      },
    });
    res.status(200).json({ availableCardProducts });
  } catch (err) {
    next(err);
  }
};

exports.getAvailableCardProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const availableCardProduct = await CardProduct.findOne({
      where: {
        id: id,
        isDeleted: "NOT",
      },
      include: [
        {
          model: CardCode,
          where: {
            codeStatus: "AVAILABLE",
          },
        },
      ],
    });

    if (!availableCardProduct)
      return res.status(400).json({ message: "can't get this cardProduct" });

    res.status(200).json({ availableCardProduct });
  } catch (err) {
    next(err);
  }
};

exports.createCardProduct = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { img, name, price } = req.body;

    const { roleAdmin } = req.user;

    if (!roleAdmin || roleAdmin !== "ADMIN") {
      throw new AppError(
        400,
        "access denied, you are not allow to access this page"
      );
    }

    if (!img || !img.trim()) {
      throw new AppError(400, "productImg is required");
    }
    if (!name || !name.trim()) {
      throw new AppError(400, "productName is required");
    }
    if (!price || !price.trim()) {
      throw new AppError(400, "productPrice is required");
    }
    if (!isNumbers.test(price.split(" ")[0])) {
      throw new AppError(400, "price must be numeric");
    }

    const newCardProduct = await CardProduct.create(
      {
        img: img,
        name: name.trim(),
        price: price.trim(),
        isDeleted: "NOT",
      },
      {
        transaction: transaction,
      }
    );
    await transaction.commit();
    res.status(201).json({ newCardProduct });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.editCardProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { img, name, price } = req.body;

    const { roleAdmin } = req.user;

    if (!roleAdmin || roleAdmin !== "ADMIN") {
      return res.status(400).json({
        message: "access denied, you are not allow to access this page",
      });
    }

    if (!img || !img.trim()) {
      return res.status(400).json({
        message: "productImg is required",
      });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "productName is required",
      });
    }
    if (!price || !price.trim()) {
      return res.status(400).json({
        message: "productPrice is required",
      });
    }
    if (!isNumbers.test(price.split(" ")[0])) {
      return res.status(400).json({
        message: "price must be numeric",
      });
    }

    const cardProduct = await CardProduct.findOne({
      where: {
        id: id,
        isDeleted: "NOT",
      },
    });

    if (!cardProduct) {
      return res.status(400).json({
        message:
          "cardProduct id not found in database; or 's status already DELETE",
      });
    }

    const updateCardProduct = await CardProduct.update(
      {
        img: img,
        name: name.trim(),
        price: price.trim(),
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.status(200).json({
      message:
        updateCardProduct == 1
          ? {
              updateCardProduct,
            }
          : "no updated CardProduct; isDeleted: " + isDeleted,
    });
  } catch (err) {
    next(err);
  }
};

exports.editStatusCardProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isDeleted } = req.body;

    const { roleAdmin } = req.user;

    if (!roleAdmin || roleAdmin !== "ADMIN") {
      return res.status(400).json({
        message: "access denied, you are n*ot allow to access this page",
      });
    }

    const cardProduct = await CardProduct.findOne({
      where: {
        id: id,
        isDeleted: "NOT",
      },
    });

    const findCardCodeStatusAvailable = await CardCode.count({
      where: {
        cardProductId: id,
        codeStatus: "AVAILABLE",
      },
    });

    if (findCardCodeStatusAvailable !== 0) {
      return res.status(400).json({
        message:
          "can't set 'isDeleted: DELETED' on this cardProduct; some codeStatus is AVAILABLE",
      });
    }

    const findCardCodeStatusPending = await CardCode.count({
      where: {
        cardProductId: id,
        codeStatus: "PENDING",
      },
    });

    if (findCardCodeStatusPending !== 0) {
      return res.status(400).json({
        message:
          "can't set 'isDeleted: DELETED' on this cardProduct; some codeStatus is PENDING",
      });
    }

    if (!cardProduct)
      return res
        .status(400)
        .json({ message: "can't edit or change isDeleted status this id" });
    if (!isDeleted || !isDeleted.trim())
      return res.status(400).json({ message: "isDeleted is required" });

    const editCardProduct = await CardProduct.update(
      {
        isDeleted: isDeleted.trim(),
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.status(200).json({
      message:
        editCardProduct == 1
          ? {
              NOW_isDeleted: isDeleted,
              AT_id: id,
            }
          : "no updated CardProduct; isDeleted: " + isDeleted,
    });
  } catch (err) {
    next(err);
  }
};
