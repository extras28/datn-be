import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";

export const Province = database.define(
  "province",
  {
    provinceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    provinceName: DataTypes.STRING,
    provinceType: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);
