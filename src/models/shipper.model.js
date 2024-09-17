import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";

export const Shipper = database.define("shipper", {
  shipperId: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  postOfficeId: DataTypes.INTEGER.UNSIGNED,
  shipperName: DataTypes.STRING,
  shipperPhone: DataTypes.STRING,
  shipperImage: DataTypes.STRING,
  shopId: DataTypes.INTEGER.UNSIGNED,
});
