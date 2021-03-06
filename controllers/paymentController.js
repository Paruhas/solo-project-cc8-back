const {
  Payment,
  Orders,
  OrderDetail,
  BankAccount,
  CardCode,
  sequelize,
} = require("../models");
const AppError = require("../utils/AppError");

const paymentStatusType = ["PENDING", "APPROVE", "CANCEL"];

exports.getAllPayment = async (req, res, next) => {
  try {
    const { sort } = req.query;

    if (!sort) {
      const payment = await Payment.findAll({
        include: [
          {
            model: Orders,
            attributes: ["id", "paymentStatus", "createdAt", "userId"],
          },
          {
            model: BankAccount,
          },
        ],
        where: {},
      });

      return res.status(200).json({ payment });
    }

    if (sort && !paymentStatusType[sort])
      return res.status(200).json({ message: "wrong sort query number" });

    const payment = await Payment.findAll({
      include: [
        {
          model: Orders,
          attributes: ["id", "paymentStatus", "createdAt", "userId"],
          where: {
            paymentStatus: paymentStatusType[sort],
          },
        },
        {
          model: BankAccount,
        },
      ],
    });

    if (payment.length == 0)
      return res.status(200).json({ message: "this payment status not found" });

    res.status(200).json({ payment });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      include: [
        {
          model: Orders,
          attributes: ["id", "paymentStatus", "createdAt", "userId"],
        },
        {
          model: BankAccount,
        },
      ],
      where: {
        id: id,
      },
    });

    if (!payment)
      return res.status(200).json({ message: "this paymentId not found" });
    if (payment.length == 0)
      return res.status(200).json({ message: "this paymentId not found" });

    res.status(200).json({ payment });
  } catch (err) {
    next(err);
  }
};

// *****
exports.uploadPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { img, dateTime, transactionNumber, bankAccountId } = req.body;
    const { id } = req.params;

    if (!img || !img.trim()) {
      throw new AppError(400, "image is required");
    }
    if (!dateTime || !dateTime.trim()) {
      throw new AppError(400, "dateTime is required");
    }
    if (!transactionNumber || !transactionNumber.trim()) {
      throw new AppError(400, "transactionNumber is required");
    }
    if (!bankAccountId || !bankAccountId.trim()) {
      throw new AppError(400, "bankAccountId is required");
    }

    const upload = await Payment.update(
      {
        img,
        dateTime,
        transactionNumber,
        bankAccountId,
      },
      {
        where: {
          id: id,
        },
      },
      {
        transaction: transaction,
      }
    );

    if (upload == 0) {
      throw new AppError(400, "upload failed");
    }

    await transaction.commit();
    res.status(200).json({ message: "upload payment slip successful" });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.approvePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    // console.log(paymentId);

    const { roleAdmin } = req.user;

    if (!roleAdmin || roleAdmin !== "ADMIN") {
      throw new AppError(
        400,
        "access denied, you are not allow to access this page"
      );
    }

    // ??????????????? payment status === PENDING
    const findOrderToChangePaymentStatus = await Orders.findOne({
      where: {
        paymentId: paymentId,
        paymentStatus: paymentStatusType[0],
      },
    });

    if (!findOrderToChangePaymentStatus) {
      throw new AppError(
        400,
        "no paymentId you want to update to APPROVE; or paymentStatus is PENDING"
      );
    }

    // ?????????????????????????????????????????????????????????????????? User ???????????? ???????????????????????????????????????
    const findPayment = await Payment.findOne({
      where: {
        id: paymentId,
      },
    });

    if (
      !findPayment.img ||
      !findPayment.dateTime ||
      !findPayment.transactionNumber ||
      !findPayment.bankAccountId
    ) {
      throw new AppError(400, "can't APPROVE payment that some data === null");
    }

    const updatePaymentStatusToApprove = await Orders.update(
      {
        paymentStatus: paymentStatusType[1],
      },
      {
        where: {
          paymentId: paymentId,
        },
      }
    );

    const findOrderToUpdateStatus = await OrderDetail.findAll({
      include: [
        {
          model: CardCode,
        },
        {
          model: Orders,
          where: { paymentId: paymentId },
        },
      ],
    });

    const cardCodeIdToEditStatus = [];
    for (key of findOrderToUpdateStatus) {
      cardCodeIdToEditStatus.push(key.dataValues.CardCode.dataValues.id);
    }

    for (key of cardCodeIdToEditStatus) {
      const cardCodeUpdate = await CardCode.update(
        {
          codeStatus: "SOLD",
        },
        {
          where: {
            id: key,
          },
        }
      );
    }

    const findOrderUpdated = await OrderDetail.findAll({
      include: [
        {
          model: CardCode,
        },
        {
          model: Orders,
          where: { paymentId: paymentId },
        },
      ],
    });

    res.status(200).json({
      message:
        "update paymentStatus to APPROVE successful and change all cardCodeStatus to 'SOLD'",
      findOrderToUpdateStatus,
      findOrderUpdated,
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    // console.log(paymentId);

    const { roleAdmin } = req.user;

    if (!roleAdmin || roleAdmin !== "ADMIN") {
      throw new AppError(
        400,
        "access denied, you are not allow to access this page"
      );
    }

    // ??????????????? payment status === PENDING
    const findOrderToChangePaymentStatus = await Orders.findOne({
      where: {
        paymentId: paymentId,
        paymentStatus: paymentStatusType[0],
      },
    });

    if (!findOrderToChangePaymentStatus) {
      throw new AppError(
        400,
        "no paymentId you want to update to CANCEL; paymentStatus is not PENDING"
      );
    }

    const updatePaymentStatusToCancel = await Orders.update(
      {
        paymentStatus: paymentStatusType[2],
      },
      {
        where: {
          paymentId: paymentId,
        },
      }
    );

    const findOrderToUpdateStatus = await OrderDetail.findAll({
      include: [
        {
          model: CardCode,
        },
        {
          model: Orders,
          where: { paymentId: paymentId },
        },
      ],
    });

    const cardCodeIdToEditStatus = [];
    for (key of findOrderToUpdateStatus) {
      cardCodeIdToEditStatus.push(key.dataValues.CardCode.dataValues.id);
    }

    for (key of cardCodeIdToEditStatus) {
      const cardCodeUpdate = await CardCode.update(
        {
          codeStatus: "AVAILABLE",
        },
        {
          where: {
            id: key,
          },
        }
      );
    }

    const findOrderUpdated = await OrderDetail.findAll({
      include: [
        {
          model: CardCode,
        },
        {
          model: Orders,
          where: { paymentId: paymentId },
        },
      ],
    });

    res.status(200).json({
      message:
        "update paymentStatus to CANCEL successful and rollback all cardCodeStatus to 'AVAILABLE':",
      findOrderToUpdateStatus,
      findOrderUpdated,
    });
  } catch (err) {
    next(err);
  }
};
