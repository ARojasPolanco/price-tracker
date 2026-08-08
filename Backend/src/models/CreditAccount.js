import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const CreditAccount = sequelize.define("CreditAccount", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
});

export default CreditAccount;
