import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";

export const District = database.define(
  "district",
  {
    districtId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    provinceId: DataTypes.INTEGER.UNSIGNED,
    districtName: DataTypes.STRING,
    districtType: DataTypes.STRING,
  },
  { timestamps: false }
);
