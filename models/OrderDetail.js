module.exports = (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define(
    "OrderDetail",
    {
      cardCodeProductId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardCodeProductImg: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardCodeProductName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardCodeProductPrice: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardCodeNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardCodeAmount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      underscored: true,
      timestamps: false,
    }
  );

  OrderDetail.associate = (models) => {
    OrderDetail.belongsTo(models.Orders, {
      foreignKey: {
        name: "orderId",
        allowNull: false,
      },
      onUpdate: "RESTRICT",
      onDelete: "RESTRICT",
    });

    OrderDetail.belongsTo(models.CardCode, {
      foreignKey: {
        name: "cardCodeId",
        allowNull: false,
      },
      onUpdate: "RESTRICT",
      onDelete: "RESTRICT",
    });
  };

  return OrderDetail;
};
