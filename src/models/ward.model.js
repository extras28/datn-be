import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";

export const Ward = database.define(
  "ward",
  {
    wardId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    districtId: DataTypes.INTEGER.UNSIGNED,
    wardName: DataTypes.STRING,
    wardType: DataTypes.STRING,
  },
  { timestamps: false }
);
