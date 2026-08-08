import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Invoice = sequelize.define("Invoice", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  supplier: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  concept: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "otros",
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("PENDIENTE", "PAGADA"),
    allowNull: false,
    defaultValue: "PENDIENTE",
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Invoice;
