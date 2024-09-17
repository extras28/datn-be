import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";

export const GoodsHandoverReceipt = database.define(
  "goods-handover-receipt",
  {
    goodsHandoverReceiptId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: {
      type: DataTypes.INTEGER.UNSIGNED,
      // allowNull: false,
    },
    shopId: DataTypes.INTEGER.UNSIGNED,

    postOfficeId: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    shipperId: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    label: DataTypes.STRING,
    createAt: DataTypes.DATE,
    deliveredImage: DataTypes.STRING,
    shipperSignature: DataTypes.STRING,
    status: DataTypes.ENUM("SENT", "NOT_SEND"),
    description: DataTypes.STRING,
    eCommercePlatform: DataTypes.STRING,
  },
  { timestamps: false }
);
