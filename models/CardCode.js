module.exports = ( sequelize, DataTypes ) => {
  const CardCode = sequelize.define('CardCode', {
      codeNumber: {
        type: DataTypes.STRING,
        },
      codeStatus: {
        type: DataTypes.ENUM,
        values: ['AVAILABLE','PENDING','SOLD'],
        allowNull: false
      }
    },{
        underscored: true,
        timestamps: false
    }
  );

  CardCode.associate = models => {
      CardCode.belongsTo(models.CardProduct, {
          foreignKey: {
              name: "cardProductId"
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
      });

      CardCode.hasOne(models.OrderDetail, {
          foreignKey: {
              name: "cardCodeId",
              allowNull: false
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
      });
  };

  return CardCode;
};