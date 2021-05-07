module.exports = ( sequelize, DataTypes ) => {
  const CardProduct = sequelize.define('CardProduct', {
      img: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      price: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      isDeleted: {
        type: DataTypes.ENUM,
        values: ['NOT','DELETED'],
        allowNull: false
      }
    },{
        underscored: true,
        timestamps: false
    }
  );

  
  CardProduct.associate = models => {
      CardProduct.hasMany(models.CardCode, {
          foreignKey: {
              name: "cardProductId",
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT'
      });

  };

  return CardProduct;
};