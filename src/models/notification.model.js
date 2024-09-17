import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";

export const Notification = database.define(
  "notification",
  {
    notificationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: DataTypes.INTEGER.UNSIGNED,
    content: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);
