module.exports = ( sequelize, DataTypes ) => {
  const Payment = sequelize.define('Payment', {
      img: {
        type: DataTypes.STRING
      },
      dateTime: {
        type: DataTypes.DATE
      },
      transactionNumber: {
        type: DataTypes.STRING
      }
    },{
        underscored: true,
        timestamps: false
    }
  );

  Payment.associate = models => {
      Payment.belongsTo(models.BankAccount, {
          foreignKey: {
              name: "bankAccountId"
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
      });
      
      Payment.hasOne(models.Orders, {
          foreignKey: {
              name: "paymentId",
              allowNull: false
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
      });

  }

  return Payment;
};