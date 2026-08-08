import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import CreditAccount from "./CreditAccount.js";

const Sale = sequelize.define("Sale", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM("MERCADO_PAGO", "CUENTA_DNI", "EFECTIVO", "CUENTA_CORRIENTE"),
    allowNull: false,
  },
  hasIssue: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  issueNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

Sale.belongsTo(CreditAccount, { foreignKey: "creditAccountId" });
CreditAccount.hasMany(Sale, { foreignKey: "creditAccountId" });

export default Sale;
