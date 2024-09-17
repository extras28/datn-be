import _ from "lodash";
import { Op, where } from "sequelize";
import { CustomError } from "../middlewares/error-handler.middleware.js";
import { Order } from "../models/order.model.js";
import {
  ORDER_STATUS,
  ORDER_STATUS_ARRAY,
} from "../shared/constants/order.constant.js";
import {
  ERROR_EMPTY_ORDER_IMAGE,
  ERROR_EMPTY_POST_OFFICE,
  ERROR_EXISTED_ORDER,
  ERROR_EXISTED_ORDER_IN_OTHER_SHOP,
  ERROR_INVALID_PARAMETERS,
  ERROR_ORDER_NOT_FOUND,
} from "../shared/errors/error.js";
import {
  deleteImageFile,
  getErrorMessageExistedOrder,
  getErrorMessageExistedOrderWithAmount,
  isValidNumber,
  removeEmptyFields,
} from "../shared/utils/utils.js";

export async function createOrder(req, res, next) {
  try {
    let {
      orderCode,
      postOfficeId,
      eCommercePlatform,
      scanTime,
      status,
      scanAccountId,
      goodsHandoverReceiptId,
    } = req.body;
    const accountId = scanAccountId
      ? Number(scanAccountId)
      : req.account.accountId;
    const shopId = req.account.shopId;
    const image = req.file;

    let order = await Order.findOne({
      where: { orderCode: orderCode, shopId: shopId },
    });

    if (!image) {
      throw new Error(ERROR_EMPTY_ORDER_IMAGE);
    }

    if (!!order) {
      if (order.shopId != shopId) {
        throw new Error(ERROR_EXISTED_ORDER_IN_OTHER_SHOP);
      }

      res.status(409).send({
        result: "failed",
        reason: ERROR_EXISTED_ORDER,
        orderStatus: order.status,
      });

      return;
    }

    if (!postOfficeId) {
      throw new Error(ERROR_EMPTY_POST_OFFICE);
    }

    if (!!Number(postOfficeId)) {
      order = await Order.create(
        removeEmptyFields({
          orderCode: orderCode,
          postOfficeId: Number(postOfficeId),
          eCommercePlatform: eCommercePlatform,
          scanTime: scanTime,
          scannedImage: `/resource/${image.path}`,
          accountId: accountId,
          status: status ? status : ORDER_STATUS.SCANNED,
          shopId: shopId,
          goodsHandoverReceiptId: isValidNumber(goodsHandoverReceiptId)
            ? Number(goodsHandoverReceiptId)
            : null,
        })
      );
    } else {
      order = await Order.create(
        removeEmptyFields({
          orderCode: orderCode,
          eCommercePlatform: eCommercePlatform,
          scanTime: scanTime,
          scannedImage: `/resource/${image.path}`,
          accountId: Number(accountId) ?? null,
          status: status ? status : ORDER_STATUS.SCANNED,
          shopId: shopId,
          goodsHandoverReceiptId: isValidNumber(goodsHandoverReceiptId)
            ? Number(goodsHandoverReceiptId)
            : null,
        })
      );
    }

    res.send({ result: "success", order: order });
  } catch (error) {
    next(error);
  }
}

export async function getListOrder(req, res, next) {
  try {
    let {
      q,
      limit,
      page,
      from,
      to,
      accountId,
      status,
      eCommercePlatform,
      postOfficeId,
      goodsHandoverReceiptId,
      excludeOrderIds,
    } = req.query;
    q = q ?? "";

    const shopId = req.account.shopId;

    excludeOrderIds = !!excludeOrderIds ? JSON.parse(excludeOrderIds) : [];

    if (!!excludeOrderIds && !_.isArray(excludeOrderIds))
      throw new Error(ERROR_INVALID_PARAMETERS);

    let conditions = {};

    if (!!goodsHandoverReceiptId && status == ORDER_STATUS.READY_TO_SHIP) {
      conditions = {
        [Op.or]: [{ orderCode: { [Op.like]: `%${q}%` } }],
        [Op.and]: [
          !!status
            ? {
                status: {
                  [Op.in]: [ORDER_STATUS.SCANNED, ORDER_STATUS.READY_TO_SHIP],
                },
              }
            : undefined,
          !!goodsHandoverReceiptId
            ? Number(goodsHandoverReceiptId) === -1
              ? { goodsHandoverReceiptId: null }
              : {
                  goodsHandoverReceiptId: {
                    [Op.or]: [null, goodsHandoverReceiptId],
                  },
                }
            : undefined,
          !!accountId ? { accountId } : undefined,
          !!shopId ? { shopId } : undefined,
          !!eCommercePlatform ? { eCommercePlatform } : undefined,
          !!postOfficeId ? { postOfficeId } : undefined,
          !!from || !!to
            ? { scanTime: { [Op.between]: [from, to] } }
            : undefined,
          !!excludeOrderIds
            ? { orderId: { [Op.notIn]: excludeOrderIds } }
            : undefined,
        ],
      };
    } else {
      conditions = {
        [Op.or]: [{ orderCode: { [Op.like]: `%${q}%` } }],
        [Op.and]: [
          !!status ? { status } : undefined,
          !!accountId ? { accountId } : undefined,
          !!shopId ? { shopId } : undefined,
          !!eCommercePlatform ? { eCommercePlatform } : undefined,
          !!postOfficeId ? { postOfficeId } : undefined,
          !!goodsHandoverReceiptId
            ? Number(goodsHandoverReceiptId) === -1
              ? { goodsHandoverReceiptId: null }
              : { goodsHandoverReceiptId }
            : undefined,
          !!from || !!to
            ? { scanTime: { [Op.between]: [from, to] } }
            : undefined,
          !!excludeOrderIds
            ? { orderId: { [Op.notIn]: excludeOrderIds } }
            : undefined,
        ],
      };
    }

    let orders;

    if (!isValidNumber(limit) || !isValidNumber(page)) {
      page = undefined;
      limit = undefined;
      orders = await Order.findAndCountAll({
        where: conditions,
        order: [["scanTime", "DESC"]],
      });
    } else {
      limit = _.toNumber(limit);
      page = _.toNumber(page);

      orders = await Order.findAndCountAll({
        where: conditions,
        limit,
        offset: limit * page,
        order: [["scanTime", "DESC"]],
      });
    }

    res.send({
      result: "success",
      page,
      total: orders.count,
      count: orders.rows.length,
      orders: orders.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const {
      orderCode,
      status,
      postOfficeId,
      goodsHandoverReceiptId,
      scanTime,
      eCommercePlatform,
    } = req.body;

    const image = req.file;

    let order = await Order.findOne({
      where: { orderCode: orderCode },
    });

    if (!order) throw new CustomError(ERROR_ORDER_NOT_FOUND, 404);

    let imgPath = `/resource/${image?.path}`;

    switch (status) {
      case ORDER_STATUS.CANCELED:
        await order.update({
          ...removeEmptyFields({
            orderCode,
            eCommercePlatform,
            scanTime,
            cancelledImage: imgPath,
            status: status,
          }),
          goodsHandoverReceiptId: null,
        });
        break;
      case ORDER_STATUS.RETURNED:
        await order.update({
          ...removeEmptyFields({
            orderCode,
            postOfficeId: isValidNumber(postOfficeId)
              ? parseInt(postOfficeId)
              : undefined,
            eCommercePlatform,
            scanTime,
            returnedImage: imgPath,
            status: status,
          }),
          goodsHandoverReceiptId: null,
        });
        break;
      case ORDER_STATUS.SCANNED:
        await order.update(
          removeEmptyFields({
            orderCode,
            postOfficeId: isValidNumber(postOfficeId)
              ? parseInt(postOfficeId)
              : undefined,
            eCommercePlatform,
            scanTime,
            returnedImage: imgPath,
            goodsHandoverReceiptId: null,
            status: status,
          })
        );
        break;
      case ORDER_STATUS.SCANNED:
        await order.update(
          removeEmptyFields({
            orderCode,
            postOfficeId: isValidNumber(postOfficeId)
              ? parseInt(postOfficeId)
              : undefined,
            eCommercePlatform,
            scanTime,
            returnedImage: imgPath,
            goodsHandoverReceiptId: null,
            status: status,
          })
        );
        break;

      default:
        await order.update(
          removeEmptyFields({
            orderCode,
            postOfficeId: isValidNumber(postOfficeId)
              ? parseInt(postOfficeId)
              : undefined,
            eCommercePlatform,
            scanTime,
            scannedImage: imgPath,
            goodsHandoverReceiptId: isValidNumber(goodsHandoverReceiptId)
              ? Number(goodsHandoverReceiptId)
              : null,
            status: status,
          })
        );
        break;
    }

    res.send({ result: "success", order });
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    let { orderIds } = req.body;

    if (!_.isArray(orderIds)) throw new Error(ERROR_INVALID_PARAMETERS);

    let deleteCount = await Order.destroy({
      where: { orderId: { [Op.in]: orderIds } },
    });
    res.send({ result: "success", deleteCount });
  } catch (error) {
    next(error);
  }
}

export async function bulkCreateOrder(req, res, next) {
  try {
    let { orders } = req.body;
    const accountId = req.account.accountId;
    const shopId = req.account.shopId;
    const images = req.files;
    const existedOrders = [];

    if (!_.isArray(orders)) {
      throw new Error(ERROR_INVALID_PARAMETERS);
    }

    for (const order of orders) {
      let existedOrder = await Order.findOne({
        where: { orderCode: order["orderCode"] },
      });

      if (!!existedOrder) {
        if (existedOrder.shopId != shopId) {
          throw new Error(ERROR_EXISTED_ORDER_IN_OTHER_SHOP);
        }

        if (order["status"] == "SCANNED") {
          existedOrders.push(existedOrder);
          // deleteImageFile("public\images\43543726-2dec-4796-8d89-0fddee834379.jpg")
        }
      }
    }

    if (existedOrders.length > 0) {
      res.status(409).send({
        result: "failed",
        reason: existedOrders.map((item) => item.orderCode).toString(),
      });

      return;
    }

    for (const order of orders) {
      if (order["status"] == "RETURNED" || order["status"] == "CANCELED") {
        let existedOrder = await Order.findOne({
          where: { orderCode: order["orderCode"] },
        });
        if (!!existedOrder) {
          await existedOrder.update(
            removeEmptyFields({
              orderCode: order["orderCode"],
              postOfficeId: Number(order["postOfficeId"]),
              eCommercePlatform: order["eCommercePlatform"],
              scanTime: order["scanTime"],
              scannedImage: `/resource/${images[orders.indexOf(order)].path}`,
              accountId: accountId,
              status: order["status"],
              shopId: shopId,
              goodsHandoverReceiptId: order["goodsHandoverReceiptId"],
            })
          );
        } else {
          await Order.create(
            removeEmptyFields({
              orderCode: order["orderCode"],
              postOfficeId: Number(order["postOfficeId"]),
              eCommercePlatform: order["eCommercePlatform"],
              scanTime: order["scanTime"],
              scannedImage: `/resource/${images[orders.indexOf(order)].path}`,
              accountId: accountId,
              status: order["status"],
              shopId: shopId,
              goodsHandoverReceiptId: order["goodsHandoverReceiptId"],
            })
          );
        }
      } else {
        await Order.create(
          removeEmptyFields({
            orderCode: order["orderCode"],
            postOfficeId: Number(order["postOfficeId"]),
            eCommercePlatform: order["eCommercePlatform"],
            scanTime: order["scanTime"],
            scannedImage: `/resource/${images[orders.indexOf(order)].path}`,
            accountId: accountId,
            status: order["status"],
            shopId: shopId,
            goodsHandoverReceiptId: order["goodsHandoverReceiptId"],
          })
        );
      }
    }

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function getTotalByStatus(req, res, next) {
  try {
    let { q, from, to, accountId, postOfficeId } = req.query;
    q = q ?? "";

    const shopId = req.account.shopId;

    const totalByStatus = {
      SCANNED: 0,
      READY_TO_SHIP: 0,
      HANDED_OVER: 0,
      RETURNED: 0,
      CANCELED: 0,
    };

    for (const status of ORDER_STATUS_ARRAY) {
      const count = await Order.count({
        where: {
          [Op.or]: [{ orderCode: { [Op.like]: `%${q}%` } }],
          [Op.and]: [
            { status },
            { shopId },
            !!accountId ? { accountId } : undefined,
            !!shopId ? { shopId } : undefined,
            !!postOfficeId ? { postOfficeId } : undefined,
            !!from || !!to
              ? { scanTime: { [Op.between]: [from, to] } }
              : undefined,
          ],
        },
      });
      totalByStatus[status] = count;
    }

    res.send({ result: "success", totalByStatus });
  } catch (error) {
    next(error);
  }
}

export async function updateScanEmployee(req, res, next) {
  try {
    let { employeeId, minOrderId, maxOrderId } = req.body;
    minOrderId = Number(minOrderId);
    maxOrderId = Number(maxOrderId);
    if (isValidNumber(minOrderId) && isValidNumber(maxOrderId)) {
      let conditions = { orderId: { [Op.between]: [minOrderId, maxOrderId] } };
      await Order.update({ accountId: employeeId }, { where: conditions });
    }

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function bulkUpdate(req, res, next) {
  try {
    let { orders } = req.body;
    const accountId = req.account.accountId;
    const shopId = req.account.shopId;
    const images = req.files;

    if (!_.isArray(orders)) {
      throw new Error(ERROR_INVALID_PARAMETERS);
    }

    for (const order of orders) {
      await existedOrder.update(
        removeEmptyFields({
          orderCode: order["orderCode"],
          postOfficeId: Number(order["postOfficeId"]),
          eCommercePlatform: order["eCommercePlatform"],
          scanTime: order["scanTime"],
          scannedImage: `/resource/${images[orders.indexOf(order)].path}`,
          accountId: accountId,
          status: order["status"] ? order["status"] : ORDER_STATUS.CANCELED,
          shopId: shopId,
          goodsHandoverReceiptId: order["goodsHandoverReceiptId"],
        })
      );
    }

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}
