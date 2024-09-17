import { DataTypes } from "sequelize";
import { database } from "../configs/db.config.js";

export const AccessToken = database.define("access-token", {
  accessTokenId: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  accountId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  accessToken: { type: DataTypes.STRING, allowNull: false },
  expireAt: { type: DataTypes.DATE },
});
