import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import CreditAccount from "./CreditAccount.js";

const CreditAccountItem = sequelize.define("CreditAccountItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  archived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  settledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

CreditAccountItem.belongsTo(CreditAccount, { foreignKey: "creditAccountId" });
CreditAccount.hasMany(CreditAccountItem, { foreignKey: "creditAccountId" });

export default CreditAccountItem;
