module.exports = (sequelize, DataTypes) => {
  const BankAccount = sequelize.define(
    "BankAccount",
    {
      accountName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.ENUM,
        values: ["NOT", "DELETED"],
        allowNull: false,
      },
    },
    {
      underscored: true,
      timestamps: false,
    }
  );

  BankAccount.associate = (models) => {
    BankAccount.hasMany(models.Payment, {
      foreignKey: {
        name: "bankAccountId",
      },
      onUpdate: "RESTRICT",
      onDelete: "RESTRICT",
    });
  };

  return BankAccount;
};
