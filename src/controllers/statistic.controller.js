import { Op, Utils } from "sequelize";
import { Order } from "../models/order.model.js";
import {
  ORDER_STATUS,
  ORDER_STATUS_ARRAY,
} from "../shared/constants/order.constant.js";
import {
  formatPostOfficeName,
  getDateTimeLabels,
  getStartAndEndOfDayISOString,
} from "../shared/utils/utils.js";
import { PostOffice } from "../models/post-office.model.js";
import moment from "moment";
import { Account } from "../models/account.model.js";

export async function getNumberOfOrderByDate(req, res, next) {
  try {
    let { from, to } = req.query;
    const shopId = req.account.shopId;

    let conditions = {
      [Op.and]: [
        !!from || !!to ? { scanTime: { [Op.between]: [from, to] } } : undefined,
        { shopId: shopId },
      ],
    };

    let total = 0;
    let scanned = 0;
    let readyToShip = 0;
    let handedOver = 0;
    let cancelled = 0;
    let returned = 0;

    total = await Order.count({ where: conditions });
    scanned = await Order.count({
      where: {
        ...conditions,
        [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.SCANNED } }],
      },
    });
    readyToShip = await Order.count({
      where: {
        ...conditions,
        [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.READY_TO_SHIP } }],
      },
    });
    handedOver = await Order.count({
      where: {
        ...conditions,
        [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.HANDED_OVER } }],
      },
    });
    cancelled = await Order.count({
      where: {
        ...conditions,
        [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.CANCELED } }],
      },
    });
    returned = await Order.count({
      where: {
        ...conditions,
        [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.RETURNED } }],
      },
    });

    res.send({
      result: "success",
      total,
      scanned,
      readyToShip,
      handedOver,
      cancelled,
      returned,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNumberOfHandedOverOrderByDate(req, res, next) {
  try {
    let { from, to, status } = req.query;
    const shopId = req.account.shopId;

    let labels = getDateTimeLabels(from, to);

    const series = [];

    for (const label of labels) {
      let value = 0;

      let { startOfDate, endOfDate } = getStartAndEndOfDayISOString(label);

      if (labels.indexOf(label) == 0) {
        startOfDate = from;
      }
      if (labels.indexOf(label) == labels.length - 1) {
        endOfDate = to;
      }
      value = await Order.count({
        where: {
          [Op.and]: [
            !!from || !!to
              ? { scanTime: { [Op.between]: [startOfDate, endOfDate] } }
              : undefined,
            !!status
              ? { status: status }
              : {
                  status: {
                    [Op.in]: [
                      ORDER_STATUS.SCANNED,
                      ORDER_STATUS.READY_TO_SHIP,
                      ORDER_STATUS.HANDED_OVER,
                    ],
                  },
                },
            { shopId: shopId },
          ],
        },
      });
      series.push({ label, value });
    }

    res.send({ result: "success", series });
  } catch (error) {
    next(error);
  }
}

export async function getStatisticOrderByPostOffice(req, res, next) {
  try {
    let { from, to } = req.query;
    const shopId = req.account.shopId;
    let conditions = {
      [Op.and]: [
        !!from || !!to ? { scanTime: { [Op.between]: [from, to] } } : undefined,
      ],
    };

    let postOffices = await PostOffice.findAll({ where: { shopId: shopId } });
    const series = [];
    for (const postOffice of postOffices) {
      let label = formatPostOfficeName(postOffice.postOfficeName);
      let value = 0;
      value = await Order.count({
        where: { ...conditions, postOfficeId: postOffice.postOfficeId },
      });
      series.push({ label, value });
    }
    res.send({ result: "success", series });
  } catch (error) {
    next(error);
  }
}

export async function getStatisticOfThisMonth(req, res, next) {
  try {
    const shopId = req.account.shopId;
    const startOfThisMonth = moment().startOf("month").toISOString();
    const endOfThisMonth = moment().endOf("month").toISOString();
    const startOfLastMonth = moment()
      .subtract(1, "month")
      .startOf("month")
      .toISOString();
    const endOfLastMonth = moment()
      .subtract(1, "month")
      .endOf("month")
      .toISOString();

    let conditionsThisMonth = {
      [Op.and]: [
        { scanTime: { [Op.between]: [startOfThisMonth, endOfThisMonth] } },
        { shopId: shopId },
      ],
    };
    let conditionsLastMonth = {
      [Op.and]: [
        { scanTime: { [Op.between]: [startOfLastMonth, endOfLastMonth] } },
        { shopId: shopId },
      ],
    };

    let total = { thisMonth: 0, growth: 0 };
    let scanned = { thisMonth: 0, growth: 0 };
    let readyToShip = { thisMonth: 0, growth: 0 };
    let handedOver = { thisMonth: 0, growth: 0 };
    let cancelled = { thisMonth: 0, growth: 0 };
    let returned = { thisMonth: 0, growth: 0 };

    for (const status of ORDER_STATUS_ARRAY) {
      switch (status) {
        case ORDER_STATUS.SCANNED:
          const scannedThisMonth = await Order.count({
            where: {
              ...conditionsThisMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.SCANNED } }],
            },
          });
          const scannedLastMonth = await Order.count({
            where: {
              ...conditionsLastMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.SCANNED } }],
            },
          });

          scanned.thisMonth = scannedThisMonth;
          scanned.growth = !!scannedLastMonth
            ? ((scannedThisMonth - scannedLastMonth) * 100) / scannedLastMonth
            : null;
          break;
        case ORDER_STATUS.HANDED_OVER:
          const handedOverThisMonth = await Order.count({
            where: {
              ...conditionsThisMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.HANDED_OVER } }],
            },
          });
          const handedOverLastMonth = await Order.count({
            where: {
              ...conditionsLastMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.HANDED_OVER } }],
            },
          });

          handedOver.thisMonth = handedOverThisMonth;
          handedOver.growth = !!handedOverLastMonth
            ? ((handedOverThisMonth - handedOverLastMonth) * 100) /
              handedOverLastMonth
            : null;
          break;
        case ORDER_STATUS.READY_TO_SHIP:
          const readyToShipThisMonth = await Order.count({
            where: {
              ...conditionsThisMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.READY_TO_SHIP } }],
            },
          });
          const readyToShipLastMonth = await Order.count({
            where: {
              ...conditionsLastMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.READY_TO_SHIP } }],
            },
          });

          readyToShip.thisMonth = readyToShipThisMonth;
          readyToShip.growth = !!readyToShipLastMonth
            ? ((readyToShipThisMonth - readyToShipLastMonth) * 100) /
              readyToShipLastMonth
            : null;
          break;
        case ORDER_STATUS.RETURNED:
          const returnedThisMonth = await Order.count({
            where: {
              ...conditionsThisMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.RETURNED } }],
            },
          });
          const returnedLastMonth = await Order.count({
            where: {
              ...conditionsLastMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.RETURNED } }],
            },
          });

          returned.thisMonth = returnedThisMonth;
          returned.growth = !!returnedLastMonth
            ? ((returnedThisMonth - returnedLastMonth) * 100) /
              returnedLastMonth
            : null;
          break;
        case ORDER_STATUS.CANCELED:
          const cancelledThisMonth = await Order.count({
            where: {
              ...conditionsThisMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.CANCELED } }],
            },
          });
          const cancelledLastMonth = await Order.count({
            where: {
              ...conditionsLastMonth,
              [Op.or]: [{ status: { [Op.like]: ORDER_STATUS.CANCELED } }],
            },
          });

          cancelled.thisMonth = cancelledThisMonth;
          cancelled.growth = !!cancelledLastMonth
            ? ((cancelledThisMonth - cancelledLastMonth) * 100) /
              cancelledLastMonth
            : null;
          break;

        default:
          break;
      }
    }

    const totalThisMonth = await Order.count({ where: conditionsThisMonth });

    const totalLastMonth = await Order.count({
      where: {
        ...conditionsLastMonth,
      },
    });

    total.thisMonth = totalThisMonth;
    total.growth = !!totalLastMonth
      ? ((totalThisMonth - totalLastMonth) * 100) / totalLastMonth
      : null;

    res.send({
      result: "success",
      total,
      scanned,
      readyToShip,
      handedOver,
      cancelled,
      returned,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStatisticByEmployee(req, res, next) {
  try {
    const shopId = req.account.shopId;
    const { from, to } = req.query;

    let conditions = {
      [Op.and]: [
        !!from || !!to ? { scanTime: { [Op.between]: [from, to] } } : undefined,
      ],
    };

    const employees = await Account.findAll({
      where: { adminAccountId: shopId },
    });

    const series = [];

    for (const employee of employees) {
      let value = await Order.count({
        where: { accountId: employee.accountId, ...conditions },
      });

      series.push({ label: employee.fullname, value: value });
    }

    res.send({ result: "success", series });
  } catch (error) {
    next(error);
  }
}
