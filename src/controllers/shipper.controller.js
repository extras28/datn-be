import _ from "lodash";
import { Shipper } from "../models/shipper.model.js";
import { isValidNumber, removeEmptyFields } from "../shared/utils/utils.js";
import { Op } from "sequelize";
import {
  ERROR_EXISTED_SHIPPER,
  ERROR_SHIPPER_NOT_EXISTED,
} from "../shared/errors/error.js";

export async function create(req, res, next) {
  try {
    let { shipperName, shipperPhone, postOfficeId } = req.body;
    const shopId = req.account.shopId;
    const avatar = req.file;

    const shipper = await Shipper.findOne({
      where: { shipperPhone: shipperPhone, shopId: shopId },
    });

    if (!!shipper) {
      throw new Error(ERROR_EXISTED_SHIPPER);
    }

    await Shipper.create({
      shipperPhone,
      shipperName,
      postOfficeId,
      shopId,
      shipperImage: avatar ? `/resource/${avatar.path}` : null,
    });

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function getListShipper(req, res, next) {
  try {
    let { q, limit, page, postOfficeId } = req.query;
    q = q ?? "";
    const shopId = req.account.shopId;

    let conditions = {
      [Op.or]: [
        { shipperName: { [Op.like]: `%${q}%` } },
        { shipperPhone: { [Op.like]: `%${q}%` } },
      ],
      [Op.and]: [
        !!postOfficeId ? { postOfficeId } : undefined,
        !!shopId ? { shopId } : undefined,
      ],
    };

    let shippers;

    if (!isValidNumber(limit) || !isValidNumber(page)) {
      page = undefined;
      limit = undefined;
      shippers = await Shipper.findAndCountAll({
        where: conditions,
        order: [["shipperId", "DESC"]],
      });
    } else {
      limit = _.toNumber(limit);
      page = _.toNumber(page);

      shippers = await Shipper.findAndCountAll({
        where: conditions,
        limit,
        offset: limit * page,
        order: [["shipperId", "DESC"]],
      });
    }

    res.send({
      result: "success",
      page,
      total: shippers.count,
      count: shippers.rows.length,
      shippers: shippers.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateShipper(req, res, next) {
  try {
    let { shipperId } = req.params;
    let { shipperPhone, shipperName } = req.body;
    const avatar = req?.file;

    let shipper = await Shipper.findOne({
      where: { shipperId: _.toNumber(shipperId) },
    });

    if (!shipper?.toJSON()) {
      throw new Error(ERROR_SHIPPER_NOT_EXISTED);
    }

    await shipper.update(
      removeEmptyFields({
        shipperName,
        shipperPhone,
        shipperImage: avatar ? `/resource/${avatar.path}` : null,
      })
    );

    res.send({ result: "success", shipper: shipper });
  } catch (error) {
    next(error);
  }
}

export async function deleteShipper(req, res, next) {
  try {
    let { shipperIds } = req.body;

    if (!_.isArray(shipperIds)) throw new Error(ERROR_INVALID_PARAMETERS);

    let deleteCount = await Shipper.destroy({
      where: { shipperId: { [Op.in]: shipperIds } },
    });
    res.send({ result: "success", deleteCount });
  } catch (error) {
    next(error);
  }
}
