const {
  Orders,
  Payment,
  OrderDetail,
  CardProduct,
  CardCode,
  BankAccount,
  User,
  sequelize,
} = require("../models");
const AppError = require("../utils/AppError");
const { QueryTypes } = require("sequelize");

exports.getOrder = async (req, res, next) => {
  try {
    const allOrders = await Orders.findAll({
      include: [
        {
          model: Payment,
          attributes: ["img", "dateTime", "transactionNumber", "bankAccountId"],
          include: [
            {
              model: BankAccount,
              attributes: [
                "accountName",
                "bankName",
                "accountNumber",
                "isDeleted",
              ],
            },
          ],
        },
        {
          model: OrderDetail,
          // attributes: ["id", "cardCodeId"],
          // include: [
          //   {
          //     model: CardCode,
          //     attributes: ["codeNumber", "codeStatus", "cardProductId"],
          //     include: [
          //       {
          //         model: CardProduct,
          //       },
          //     ],
          //   },
          // ],
        },
      ],
      attributes: ["id", "paymentStatus", "createdAt", "userId", "paymentId"],
    });

    return res.status(200).json({ allOrders });
  } catch (err) {
    next(err);
  }
};

exports.getOrderByOrderId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ordersById = await Orders.findAll({
      include: [
        {
          model: Payment,
          attributes: ["img", "dateTime", "transactionNumber", "bankAccountId"],
          include: [
            {
              model: BankAccount,
              attributes: [
                "accountName",
                "bankName",
                "accountNumber",
                "isDeleted",
              ],
            },
          ],
        },
        {
          model: OrderDetail,
          // attributes: ["id","cardCodeId"],
          include: [
            {
              model: CardCode,
              //     attributes: ["codeStatus"],
              //         include: [
              //           {
              //             model: CardProduct,
              //           }
              //         ]
            },
          ],
        },
      ],
      where: { id: id },
      // attributes: ["id", "paymentStatus", "createdAt", "userId", "paymentId"],
    });

    if (ordersById.length == 0)
      return res
        .status(400)
        .json({ message: "no orders by this orderId found" });

    return res.status(200).json({ ordersById });
  } catch (err) {
    next(err);
  }
};

exports.getOrderByOrderIdCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderId } = req.body;

    const orderDetailById = await sequelize.query(
      "SELECT o.id , o.payment_status, o.created_at , o.user_id , o.payment_id , od.card_code_product_img , od.card_code_product_name , od.card_code_product_price , od.order_id , count(od.card_code_product_name) AS total FROM orders AS o JOIN order_details AS od ON o.id = od.order_id WHERE o.user_id = ? AND od.order_id = ? GROUP BY card_code_product_name ,order_id ",
      { replacements: [id, orderId], type: QueryTypes.SELECT }
    );

    if (orderDetailById.length == 0)
      return res
        .status(400)
        .json({ message: "no orders by this orderId found" });

    return res.status(200).json({ orderDetailById });
  } catch (err) {
    next(err);
  }
};

exports.getOrderByOrderIdPaymentStatusAPPROVE = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ordersByIdPaymentStatusAPPROVE = await Orders.findAll({
      include: [
        // {
        // model: Payment,
        // attributes: ["img", "dateTime", "transactionNumber", "bankAccountId"],
        // include: [
        //   {
        //     model: BankAccount,
        //     attributes: [
        //       "accountName",
        //       "bankName",
        //       "accountNumber",
        //       "isDeleted",
        //     ],
        //   },
        // ],
        // },
        {
          model: OrderDetail,
          // attributes: ["id","cardCodeId"],
          include: [
            {
              model: CardCode,
              //     attributes: ["codeStatus"],
              //         include: [
              //           {
              //             model: CardProduct,
              //           }
              //         ]
            },
          ],
        },
      ],
      where: { id: id, paymentStatus: "APPROVE" },
      // attributes: ["id", "paymentStatus", "createdAt", "userId", "paymentId"],
    });

    if (ordersByIdPaymentStatusAPPROVE.length == 0)
      return res.status(400).json({
        message:
          "no orders by this orderId found; or paymentStatus !== APPROVE",
      });

    return res.status(200).json({ ordersByIdPaymentStatusAPPROVE });
  } catch (err) {
    next(err);
  }
};

exports.getOrderByUserId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allOrdersByUserId = await Orders.findAll({
      include: [
        {
          model: Payment,
          attributes: ["img", "dateTime", "transactionNumber", "bankAccountId"],
          include: [
            {
              model: BankAccount,
              attributes: [
                "accountName",
                "bankName",
                "accountNumber",
                "isDeleted",
              ],
            },
          ],
        },
        {
          model: OrderDetail,
          // attributes: ["id", "cardCodeId"],
          // include: [
          //   {
          //     model: CardCode,
          //     attributes: ["codeNumber", "codeStatus", "cardProductId"],
          //     include: [
          //       {
          //         model: CardProduct,
          //       },
          //     ],
          //   },
          // ],
        },
      ],
      where: { userId: id },
      attributes: ["id", "paymentStatus", "createdAt", "userId", "paymentId"],
      order: [["id", "DESC"]],
    });

    if (allOrdersByUserId.length == 0)
      return res
        .status(400)
        .json({ message: "no orders by this userId found" });

    return res.status(200).json({ allOrdersByUserId });
  } catch (err) {
    next(err);
  }
};

exports.placeOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      // userId,
      orderItems,
    } = req.body;
    const userId = req.user.id;
    // console.log(req.user);
    // console.log(userId);

    // validate
    const findUser = User.findOne({
      where: { id: userId },
    });
    if (!findUser) {
      throw new AppError(400, "this userId not found");
    }

    // create เพื่อเอา payment_id มาใส่
    const newPayment = await Payment.create(
      {},
      {
        transaction: transaction,
      }
    );

    const newOrder = await Orders.create(
      {
        paymentStatus: "PENDING",
        userId: userId,
        paymentId: newPayment.dataValues.id,
      },
      {
        transaction: transaction,
      }
    );

    const orderLists = await Promise.all(
      orderItems.map(async (item, index) => {
        const findCardCode = await CardCode.findAll({
          where: {
            codeStatus: "AVAILABLE",
            cardProductId: item.cardProductId,
          },
          limit: +item.amount,
        });

        const changeAmountToCardCode = await Promise.all(
          findCardCode.map(async (item, index) => {
            return item;
          })
        );

        if (+item.amount !== changeAmountToCardCode.length) {
          throw new AppError(
            400,
            "can't place order to this product; not enough product amount to place this order"
          );
        }

        // item.amount = changeAmountToCardCode;

        item.amountItemDetail = changeAmountToCardCode;

        // console.log(item.amount, "item.amount");
        // console.log(changeAmountToCardCode, "changeAmountToCardCode");

        const findCardProduct = await CardProduct.findOne({
          where: {
            id: item.cardProductId,
            isDeleted: "NOT",
          },
        });

        if (!findCardProduct) {
          throw new AppError(
            400,
            "can't place order to this product; isDeleted:'DELETE' "
          );
        }

        item.cardProductId = findCardProduct.id;
        item.cardProductImg = findCardProduct.img;
        item.cardProductName = findCardProduct.name;
        item.cardProductPrice = findCardProduct.price;
        item.cardProductIsDeleted = findCardProduct.isDeleted;
        item.cardProductAmount = item.amount;

        // console.log(item, "195");
        return item;
      })
    );
    // console.log(orderLists, "199");

    // ทำ Array เปล่า แล้ว push ค่า cardCodeId ที่สั่งซื้อเข้าไป เพื่อทำการบันทึกลงใน database<order_details>
    // cardCodeId ดึงออกมาจาก orderLists ; สร้างเป็น OBJ ARR ที่สามารถ bulkcreate เข้า Database ได้เลย
    const insertToOrderDetail = [];
    for (let item of orderLists) {
      for (i = 0; i < item.amountItemDetail.length; i++) {
        // console.log(item);
        insertToOrderDetail.push({
          cardCodeProductId: item.cardProductId,
          cardCodeProductImg: item.cardProductImg,
          cardCodeProductName: item.cardProductName,
          cardCodeProductPrice: item.cardProductPrice,
          cardCodeAmount: item.amount,
          cardCodeId: item.amountItemDetail[i].id,
          cardCodeNumber: item.amountItemDetail[i].codeNumber,
          orderId: newOrder.id,
        });
      }
    }

    // console.log(insertToOrderDetail, "218");

    // throw new Error();

    const newOrderItems = await OrderDetail.bulkCreate(insertToOrderDetail, {
      transaction: transaction,
    });

    // ทำ Array เปล่า แล้ว push ค่า cardCodeId ที่สั่งซื้อเข้าไป แล้วทำการส่ง req.body ปลอมไปให้กับ controller<cardCode-editCardCodeStatus>
    // ทำให้ codeStatus: AVAILABLE > PENDING เลยทันที ; fromOrder ส่งไปเพื่อทำให้ <cardCode-editCardCodeStatus> ไม่ส่ง res ซ้ำ
    const findOrderedCardCodeIds = [];
    for (let item of orderLists) {
      for (i = 0; i < item.amountItemDetail.length; i++) {
        findOrderedCardCodeIds.push(item.amountItemDetail[i].id);
      }
    }

    req.body = {
      codeStatus: "0",
      changeTo: "1",
      ids: findOrderedCardCodeIds,
      fromOrder: true,
    };

    await transaction.commit();

    res.status(200).json({
      newOrder,
      orderLists,
      newOrderItems,
    });
    next();
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};
