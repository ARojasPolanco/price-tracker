import { DataTypes } from "sequelize";
import sequelize from "../config/database/database.js";
import { UUIDV4 } from "sequelize";

const Error = sequelize.define("errors", {
  id: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
  },
  status: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  stack: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default Error;
