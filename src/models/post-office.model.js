import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";

export const PostOffice = database.define(
  "post-office",
  {
    postOfficeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    postOfficeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shopId: DataTypes.INTEGER.UNSIGNED,

    logo: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
  },
  { timestamps: false }
);
