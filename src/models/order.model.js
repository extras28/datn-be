import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";
import { ORDER_STATUS } from "../shared/constants/order.constant.js";

export const Order = database.define(
  "order",
  {
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    postOfficeId: DataTypes.INTEGER.UNSIGNED,
    accountId: DataTypes.INTEGER.UNSIGNED,
    shopId: DataTypes.INTEGER.UNSIGNED,
    goodsHandoverReceiptId: DataTypes.INTEGER.UNSIGNED,
    orderCode: { type: DataTypes.STRING, allowNull: false },
    scanTime: { type: DataTypes.DATE, allowNull: false },
    scannedImage: DataTypes.STRING,
    returnedImage: DataTypes.STRING,
    cancelledImage: DataTypes.STRING,
    status: DataTypes.ENUM(
      ORDER_STATUS.SCANNED,
      ORDER_STATUS.READY_TO_SHIP,
      ORDER_STATUS.HANDED_OVER,
      ORDER_STATUS.RETURNED,
      ORDER_STATUS.CANCELED
    ),
    eCommercePlatform: DataTypes.STRING,
  },
  { timestamps: false }
);
