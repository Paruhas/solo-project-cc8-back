const { sequelize } = require("../models");
const AppError = require("../utils/AppError");

exports.uploadPayment = async (req, res, next) => {
  try {
    res.status(200).json({ paymentImg: req.imgUrl });
  } catch (err) {
    next(err);
  }
};

exports.uploadProduct = async (req, res, next) => {
  try {
    res.status(200).json({ cardProductImg: req.imgUrl });
  } catch (err) {
    next(err);
  }
};
