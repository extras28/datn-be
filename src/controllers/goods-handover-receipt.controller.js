import { GoodsHandoverReceipt } from "../models/goods-handover-receipt.model.js";
import {
  ERROR_EMPTY_ORDER,
  ERROR_EMPTY_PACKAGE_IMAGE,
  ERROR_EMPTY_SHIPPER,
  ERROR_EXISTED_RECEIPT,
  ERROR_INVALID_PARAMETERS,
  ERROR_NOT_FOUND_RECEIPT,
} from "../shared/errors/error.js";
import { isValidNumber, removeEmptyFields } from "../shared/utils/utils.js";
import { Order } from "../models/order.model.js";
import { ORDER_STATUS } from "../shared/constants/order.constant.js";
import _ from "lodash";
import { Op, Sequelize } from "sequelize";
import { ADMIN } from "../shared/constants/account.constant.js";

export async function create(req, res, next) {
  try {
    let {
      label,
      createAt,
      description,
      shipperId,
      orderIds,
      status,
      eCommercePlatform,
      postOfficeId,
    } = req.body;
    const accountId = req.account.accountId;
    const shopId = req.account.shopId;
    const images = req.files;

    let deliveredImage = images["package"]
      ? `/resource/${images["package"][0]?.path}`
      : "";
    let shipperSignature = images["signature"]
      ? `/resource/${images["signature"][0]?.path}`
      : "";

    orderIds = !!orderIds ? JSON.parse(orderIds) : [];
    status = status ?? "NOT_SEND";

    // const goodsHandoverReceipt = await GoodsHandoverReceipt.findOne({
    //   where: { label: label },
    // });

    // if (!!goodsHandoverReceipt) {
    //   throw new Error(ERROR_EXISTED_RECEIPT);
    // }

    postOfficeId = Number(postOfficeId);
    shipperId = shipperId ? Number(shipperId) : null;

    let receipt = await GoodsHandoverReceipt.create(
      removeEmptyFields({
        label,
        createAt,
        description,
        shipperId,
        deliveredImage,
        accountId,
        status,
        shipperSignature,
        eCommercePlatform,
        postOfficeId,
        shopId,
      })
    );

    if (!_.isArray(orderIds)) throw new Error(ERROR_INVALID_PARAMETERS);

    await Order.update(
      {
        status:
          status === "NOT_SEND"
            ? ORDER_STATUS.READY_TO_SHIP
            : ORDER_STATUS.HANDED_OVER,
        goodsHandoverReceiptId: receipt.toJSON().goodsHandoverReceiptId,
      },
      { where: { orderId: { [Op.in]: orderIds } } }
    );

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function getListReceipt(req, res, next) {
  try {
    let { q, page, limit, status, from, to, accountId, postOfficeId } =
      req.query;
    const shopId = req.account.shopId;
    q = q ?? "";

    let conditions = {
      [Op.or]: [
        { label: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { eCommercePlatform: { [Op.like]: `%${q}%` } },
      ],
      [Op.and]: [
        !!status ? { status } : undefined,
        !!accountId ? { accountId } : undefined,
        !!shopId ? { shopId } : undefined,
        !!postOfficeId ? { postOfficeId } : undefined,
        !!from || !!to ? { createAt: { [Op.between]: [from, to] } } : undefined,
      ],
    };

    let receipts;

    if (!isValidNumber(limit) || !isValidNumber(page)) {
      page = undefined;
      limit = undefined;
      receipts = await GoodsHandoverReceipt.findAndCountAll({
        where: conditions,
        order: [["createAt", "DESC"]],
        attributes: {
          include: [
            [
              Sequelize.literal(
                "(SELECT COUNT(*) FROM `orders` AS `Order` WHERE `Order`.`goodsHandoverReceiptId` = `goods-handover-receipt`.`goodsHandoverReceiptId` AND `Order`.`status` != 'CANCELED')"
              ),
              "orderCount",
            ],
          ],
        },
      });
    } else {
      limit = _.toNumber(limit);
      page = _.toNumber(page);

      receipts = await GoodsHandoverReceipt.findAndCountAll({
        where: conditions,
        limit,
        offset: limit * page,
        order: [["createAt", "DESC"]],
        attributes: {
          include: [
            [
              Sequelize.literal(
                "(SELECT COUNT(*) FROM `orders` AS `Order` WHERE `Order`.`goodsHandoverReceiptId` = `goods-handover-receipt`.`goodsHandoverReceiptId` AND `Order`.`status` != 'CANCELED')"
              ),
              "orderCount",
            ],
          ],
        },
      });
    }

    res.send({
      result: "success",
      page,
      total: receipts.count,
      count: receipts.rows.length,
      receipts: receipts.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    let {
      label,
      createAt,
      description,
      shipperId,
      orderIds,
      status,
      eCommercePlatform,
      postOfficeId,
    } = req.body;
    const accountId = req.account.accountId;
    const images = req.files;
    const { id } = req.params;
    const role = req.account.role;

    let deliveredImage = images["package"]
      ? `/resource/${images["package"][0]?.path}`
      : "";
    let shipperSignature = images["signature"]
      ? `/resource/${images["signature"][0]?.path}`
      : "";

    orderIds = !!orderIds ? JSON.parse(orderIds) : [];
    status = status ?? "NOT_SEND";

    const goodsHandoverReceipt = await GoodsHandoverReceipt.findOne({
      where: { goodsHandoverReceiptId: id },
    });

    if (!goodsHandoverReceipt) {
      throw new Error(ERROR_NOT_FOUND_RECEIPT);
    }

    if (status == "SENT" && role != "ADMIN") {
      if (!shipperId) {
        throw new Error(ERROR_EMPTY_SHIPPER);
      }

      if (!shipperSignature) {
        throw new Error(ERROR_EMPTY_SHIPPER);
      }

      if (!deliveredImage) {
        throw new Error(ERROR_EMPTY_PACKAGE_IMAGE);
      }

      if (orderIds.length == 0) {
        throw new Error(ERROR_EMPTY_ORDER);
      }
    }

    await goodsHandoverReceipt.update(
      removeEmptyFields({
        label,
        createAt,
        description,
        shipperId,
        deliveredImage,
        accountId,
        status,
        shipperSignature,
        eCommercePlatform,
        postOfficeId,
      })
    );

    if (!_.isArray(orderIds)) throw new Error(ERROR_INVALID_PARAMETERS);

    let orderStatus = ORDER_STATUS.SCANNED;

    if (status === "NOT_SEND") {
      orderStatus = ORDER_STATUS.READY_TO_SHIP;
    } else if (status === "SENT") {
      orderStatus = ORDER_STATUS.HANDED_OVER;
    }

    const ordersToUpdate = await Order.findAll({
      where: {
        goodsHandoverReceiptId: goodsHandoverReceipt.goodsHandoverReceiptId,
        orderId: { [Op.notIn]: orderIds }, // Filter out orders that should not be updated
      },
    });

    // Update orders
    await Order.update(
      {
        status: ORDER_STATUS.SCANNED,
        goodsHandoverReceiptId: null,
      },
      {
        where: {
          orderId: { [Op.in]: ordersToUpdate.map((order) => order.orderId) },
        },
      }
    );

    // Update remaining orders with the new status and goodsHandoverReceiptId
    await Order.update(
      {
        status: orderStatus,
        goodsHandoverReceiptId: goodsHandoverReceipt.goodsHandoverReceiptId,
      },
      { where: { orderId: { [Op.in]: orderIds } } }
    );

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function deleteReceipt(req, res, next) {
  try {
    let { ids } = req.body;

    if (!_.isArray(ids)) throw new Error(ERROR_INVALID_PARAMETERS);

    await Order.update(
      {
        status: ORDER_STATUS.SCANNED,
        goodsHandoverReceiptId: null,
      },
      { where: { goodsHandoverReceiptId: { [Op.in]: ids } } }
    );

    let deleteCount = await GoodsHandoverReceipt.destroy({
      where: { goodsHandoverReceiptId: { [Op.in]: ids } },
    });

    res.send({ result: "success", deleteCount });
  } catch (error) {
    next(error);
  }
}

export async function copyReceiptContent(req, res, next) {
  try {
    const { id } = req.params;

    const receipt = await GoodsHandoverReceipt.findOne({
      where: { goodsHandoverReceiptId: id },
    });

    if (!receipt) {
      throw new Error(ERROR_NOT_FOUND_RECEIPT);
    }

    const orderCodes = await Order.findAll({
      where: { goodsHandoverReceiptId: id },
      attributes: ["orderCode"],
    });

    res.status(200).send({
      result: "success",
      label: receipt.label,
      orderCodes: orderCodes.map((item) => item.orderCode),
    });
  } catch (error) {
    next(error);
  }
}
