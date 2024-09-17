import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";
import { ADMIN, EMPLOYEE } from "../shared/constants/account.constant.js";

export const Account = database.define(
  "account",
  {
    accountId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    adminAccountId: { type: DataTypes.INTEGER.UNSIGNED },
    username: { type: DataTypes.STRING, allowNull: false },
    fullname: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    logo: DataTypes.STRING,
    address: DataTypes.STRING,
    firstTimePassword: DataTypes.STRING,
    firstTimePassword: DataTypes.STRING,
    salt: DataTypes.STRING(16),
    role: DataTypes.ENUM(ADMIN, EMPLOYEE),
    phone: DataTypes.STRING(16),
  },
  { timestamps: false }
);
