module.exports = ( sequelize, DataTypes ) => {
  const Orders = sequelize.define('Orders', {
        paymentStatus: {
          type: DataTypes.ENUM,
          values: ['PENDING', 'APPROVE', 'CANCEL'],
          allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()')
        },        
      },{
          underscored: true,
          timestamps: false
    }
  );

  Orders.associate = models => {
      Orders.belongsTo(models.User, {
          foreignKey: {
              name: "userId",
              allowNull: false
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
      });

      Orders.belongsTo(models.Payment, {
          foreignKey: {
              name: "paymentId",
              allowNull: false
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
      });

      Orders.hasMany(models.OrderDetail, {
          foreignKey: {
              name: "orderId",
              allowNull: false
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
      });
  };

  return Orders;
};