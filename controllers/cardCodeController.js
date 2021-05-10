const { CardCode, sequelize, CardProduct } = require("../models");
const AppError = require("../utils/AppError");

const cardCodeStatusType = ["AVAILABLE", "PENDING", "SOLD"];

exports.getAllCardCodes = async (req, res, next) => {
  try {
    // ให้ส่งเข้ามาเป็น query ว่าจะเอาการ์ดที่มี code status แบบไหน โดยแมพจาก array ถ้าไม่ใส่ก็จะหาทั้งหมด
    const { status } = req.query;

    if (Boolean(status) === false || !status) {
      const cardCodes = await CardCode.findAll({
        where: {},
      });
      return res.status(200).json({ cardCodes });
    }

    // ถ้าใส่เลขที่ไม่ตรงกับ ARR status ก็จะ return res400 ทันที
    if (!cardCodeStatusType[status]) {
      return res
        .status(400)
        .json({
          message:
            "can't get this cardCode; this cardCode's status is undefined",
        });
    }

    const cardCodes = await CardCode.findAll({
      where: {
        codeStatus: cardCodeStatusType[status],
      },
    });
    return res.status(200).json({ cardCodes });
  } catch (err) {
    next(err);
  }
};

exports.getCardCodeByProductId = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const { status } = req.query;

    if (Boolean(status) === false || !status) {
      const cardCodesByProduct = await CardCode.findAll({
        where: {
          cardProductId: pid,
        },
      });
      if (cardCodesByProduct.length === 0)
        return res
          .status(400)
          .json({ message: "can't get this cardCode; no cardCode founded" });
      return res.status(200).json({ cardCodesByProduct });
    }

    if (!cardCodeStatusType[status]) {
      return res
        .status(400)
        .json({
          message:
            "can't get this cardCode; this cardCode's status is undefined",
        });
    }

    const cardCodesByProduct = await CardCode.findAll({
      where: {
        codeStatus: cardCodeStatusType[status],
        cardProductId: pid,
      },
    });
    if (cardCodesByProduct.length === 0)
      return res
        .status(400)
        .json({ message: "can't get this cardCode; no cardCode founded" });

    return res.status(200).json({ cardCodesByProduct });
  } catch (err) {
    next(err);
  }
};

exports.createCardCodeByProductId = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { codeNumbers } = req.body;
    const { pid } = req.params;

    const { roleAdmin } = req.user;

    if (!roleAdmin || roleAdmin !== "ADMIN") {
      throw new AppError(
        400,
        "access denied, you are not allow to access this page"
      );
    }

    const findProduct = await CardProduct.findOne({
      where: {
        id: pid,
      },
    });
    if (!findProduct) {
      throw new AppError(400, "cardProduct not found");
    }
    if (findProduct.isDeleted === "DELETED") {
      throw new AppError(400, "can't add cardCode to DELETED cardProduct");
    }

    if (codeNumbers.length === 0) {
      throw new AppError(400, "no codeNumber in codeNumbers");
    }
    for (key of codeNumbers) {
      if (!key.codeNumber || !key.codeNumber.trim()) {
        throw new AppError(400, "codeNumber is required or not be blank");
      }
    }

    const insertData = await Promise.all(
      codeNumbers.map((item, index) => {
        item.codeNumber = codeNumbers[index].codeNumber;
        item.codeStatus = "Available";
        item.cardProductId = pid;
        return item;
      })
    );

    const addCardCode = await CardCode.bulkCreate(insertData, { transaction });

    await transaction.commit();
    res.status(201).json({
      message: "Add card's codeNumber successful",
      addCardCode,
    });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.editCardCodeStatus = async (req, res, next) => {
  try {
    const { codeStatus, changeTo, ids } = req.body;

    const findCodeNumbers = await CardCode.findAll({
      where: {
        id: ids,
      },
    });

    if (findCodeNumbers.length !== ids.length) {
      return res
        .status(400)
        .json({ message: "enter id in 'ids' is out of range" });
    }
    if (!cardCodeStatusType[codeStatus] || !cardCodeStatusType[changeTo]) {
      return res
        .status(400)
        .json({
          message:
            "no cardCodeStatusType for this number; Please enter correct number 'codeStatus' or 'changeTo'",
        });
    }
    if (cardCodeStatusType[codeStatus] === cardCodeStatusType[changeTo]) {
      return res
        .status(400)
        .json({ message: "codeStatus and changeTo must not equal" });
    }
    for (key of findCodeNumbers) {
      if (key.codeStatus !== cardCodeStatusType[codeStatus]) {
        return res
          .status(400)
          .json({
            message:
              "codeStatus at cardCode id " +
              key.id +
              " is not " +
              cardCodeStatusType[codeStatus],
          });
      }
    }

    const editCodeNumbers = await CardCode.update(
      {
        codeStatus: cardCodeStatusType[changeTo],
      },
      {
        where: {
          id: ids,
        },
      }
    );

    const findUpdatedCardCode = await CardCode.findAll({
      where: {
        id: ids,
      },
    });

    if (req.body.fromOrder) {
      return;
    } else {
      return res
        .status(200)
        .json(
          editCodeNumbers
            ? { updatedCardCode: findUpdatedCardCode }
            : { message: "no updated cardCode" }
        );
    }
  } catch (err) {
    next(err);
  }
};
