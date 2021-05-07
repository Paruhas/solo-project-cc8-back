const { BankAccount , sequelize } = require("../models");
const AppError = require("../utils/AppError")

const isNumbers = /^\d*$/;

exports.getAllBankAccounts = async (req, res, next) => { //  not use
  try {
    const bankAccounts = await BankAccount.findAll();
    res.status(200).json({ bankAccounts });
  } catch(err) {
    next(err);
  }
};

exports.getBankAccount = async (req, res, next) => { //  not use
  try {
    const { id } = req.params;
    const bankAccount = await BankAccount.findOne(
      { 
        where : {
          id
        }
      });
    if (!bankAccount) return res.status(400).json({ message: "can't get this bankAccount"});

    res.status(200).json({ bankAccount });
  } catch(err) {
    next(err);
  }
};

exports.getAllAvailableBankAccounts = async (req, res, next) => {
  try {
    const availableBankAccounts = await BankAccount.findAll({
      where: {
        isDeleted: "NOT"
      }
    });
    res.status(200).json({ availableBankAccounts });
  } catch(err) {
    next(err);
  }
};

exports.getAvailableBankAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const availableBankAccount = await BankAccount.findOne(
      { 
        where : {
          id: id,
          isDeleted: "NOT"
        }
      });
    if (!availableBankAccount) return res.status(400).json({ message: "can't get this bankAccount"});

    res.status(200).json({ availableBankAccount });
  } catch(err) {
    next(err);
  }
};

exports.createBankAccount = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { accountName , bankName, accountNumber } = req.body;
    const { roleAdmin } = req.user;

    if ( !roleAdmin || roleAdmin !== "ADMIN" ) {
      throw new AppError(400, "access denied, you are not allow to access this page")
    }
    
    if (!accountName || !accountName.trim()) {
      throw new AppError(400, "accountName is required");
    };
    if (!bankName || !bankName.trim()) {
      throw new AppError(400, "bankName is required");
    };
    if (!accountNumber || !accountNumber.trim()) {
      throw new AppError(400, "accountNumber is required");
    };
    if (!(accountNumber.length === 10)) {
      throw new AppError(400, "accountNumber is to short");
    };
    if (!(isNumbers.test(accountNumber))) {
      throw new AppError(400, "accountNumber must be numeric");
    };

    const newBankAccount = await BankAccount.create(
      {
        accountName: accountName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        isDeleted:"NOT"
      },{
        transaction:transaction
      });
    await transaction.commit();
    res.status(201).json({ newBankAccount });
  } catch(err) {
    await transaction.rollback();
    next(err);
  }
};

exports.editStatusBankAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isDeleted } = req.body;

    const { roleAdmin } = req.user;

    if ( !roleAdmin || roleAdmin !== "ADMIN" ) {
      throw new AppError(400, "access denied, you are not allow to access this page")
    }

    const bankAccount = await BankAccount.findOne(
      { 
        where : {
          id: id,
        }
      });
    
    if (!bankAccount) return res.status(400).json({ message: "can't edit or change isDeleted status this id"});
    if (bankAccount.dataValues.isDeleted === "DELETED") return res.status(400).json({ message: "this id status is 'DELETED'; you cannot change this status anymore"});
    if (!isDeleted || !isDeleted.trim()) return res.status(400).json({ message: 'isDeleted is required'});

    const editBankAccount = await BankAccount.update(
      {
        isDeleted: isDeleted.trim()
      },{
        where: {
          id: id
        }
      }
    );
    res.status(200).json({
      message: editBankAccount == 1 ? {
        NOW_isDeleted: isDeleted,
        AT_id: id
      } : "no updated BankAccount; isDeleted: " + isDeleted
    });
  } catch(err) {
    next(err);
  }
};