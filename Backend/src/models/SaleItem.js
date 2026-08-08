import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Sale from "./Sale.js";
import Product from "./Product.js";

const SaleItem = sequelize.define("SaleItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
  },
  unitPriceAtSale: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

SaleItem.belongsTo(Sale, { foreignKey: "saleId" });
Sale.hasMany(SaleItem, { foreignKey: "saleId" });

SaleItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(SaleItem, { foreignKey: "productId" });

export default SaleItem;
