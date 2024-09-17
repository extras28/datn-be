import { EMPLOYEE } from "../shared/constants/account.constant.js";
import { AccessToken } from "./access-token.model.js";
import { Account } from "./account.model.js";
import { District } from "./district.model.js";
import { Notification } from "./notification.model.js";
import { Order } from "./order.model.js";
import { Province } from "./province.model.js";
import { Ward } from "./ward.model.js";
import { GoodsHandoverReceipt } from "./goods-handover-receipt.model.js";
import { PostOffice } from "./post-office.model.js";
import { Shipper } from "./shipper.model.js";

export * from "./account.model.js";
export * from "./goods-handover-receipt.model.js";
export * from "./notification.model.js";
export * from "./order.model.js";
export * from "./post-office.model.js";
export * from "./access-token.model.js";
export * from "./district.model.js";
export * from "./province.model.js";
export * from "./ward.model.js";

// Associations
PostOffice.hasMany(Order, {
  foreignKey: "postOfficeId",
});

PostOffice.hasMany(GoodsHandoverReceipt, {
  foreignKey: "postOfficeId",
});

Order.belongsTo(GoodsHandoverReceipt, {
  foreignKey: "goodsHandoverReceiptId",
});
Order.belongsTo(Account, { foreignKey: "accountId" });

Account.hasMany(GoodsHandoverReceipt, {
  foreignKey: "accountId",
});

AccessToken.belongsTo(Account, { foreignKey: "accountId" });

Ward.belongsTo(District, { foreignKey: "districtId" });
District.belongsTo(Province, { foreignKey: "provinceId" });

Notification.belongsTo(Account, { foreignKey: "accountId" });

GoodsHandoverReceipt.belongsTo(Shipper, {
  foreignKey: "shipperId",
  onDelete: "SET NULL",
});
Shipper.belongsTo(PostOffice, {
  foreignKey: "postOfficeId",
});

Account.hasMany(Account, {
  foreignKey: "adminAccountId",
  sourceKey: "accountId",
  as: "employees",
  constraints: false,
  scope: {
    role: EMPLOYEE,
  },
});
