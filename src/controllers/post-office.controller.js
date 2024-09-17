import _ from "lodash";
import { Op } from "sequelize";
import { PostOffice } from "../models/post-office.model.js";
import {
  ERROR_EXISTED_POST_OFFICE,
  ERROR_POST_OFFICE_NOT_EXISTED,
} from "../shared/errors/error.js";
import { isValidNumber, removeEmptyFields } from "../shared/utils/utils.js";

export async function create(req, res, next) {
  try {
    const { postOfficeName, address, phone } = req.body;
    let logo = "";
    const shopId = req.account.shopId;
    if (req.file.path) {
      logo = `/resource/${req.file.path}`;
    }

    const postOffice = await PostOffice.findOne({
      where: { postOfficeName: postOfficeName, shopId: shopId },
    });

    if (!!postOffice) {
      throw new Error(ERROR_EXISTED_POST_OFFICE);
    }

    PostOffice.create({
      postOfficeName,
      address,
      phone,
      logo,
      shopId,
    });

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function getListPostOffice(req, res, next) {
  try {
    let { q, limit, page } = req.query;
    const shopId = req.account.shopId;
    q = q ?? "";

    let conditions = {
      [Op.or]: [
        { postOfficeName: { [Op.like]: `%${q}%` } },
        { address: { [Op.like]: `%${q}%` } },
        { phone: { [Op.like]: `%${q}%` } },
      ],
      [Op.and]: [!!shopId ? { shopId } : undefined],
    };

    let postOffices;

    if (!isValidNumber(limit) || !isValidNumber(page)) {
      page = undefined;
      limit = undefined;
      postOffices = await PostOffice.findAndCountAll({
        where: conditions,
        order: [["postOfficeId", "DESC"]],
      });
    } else {
      limit = _.toNumber(limit);
      page = _.toNumber(page);

      postOffices = await PostOffice.findAndCountAll({
        where: conditions,
        limit,
        offset: limit * page,
        order: [["postOfficeId", "DESC"]],
      });
    }

    res.send({
      result: "success",
      page,
      total: postOffices.count,
      count: postOffices.rows.length,
      postOffices: postOffices.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePostOffice(req, res, next) {
  try {
    let { postOfficeIds } = req.body;

    if (!_.isArray(postOfficeIds)) throw new Error(ERROR_INVALID_PARAMETERS);

    let deleteCount = await PostOffice.destroy({
      where: { postOfficeId: { [Op.in]: postOfficeIds } },
    });
    res.send({ result: "success", deleteCount });
  } catch (error) {
    next(error);
  }
}

export async function updatePostOffice(req, res, next) {
  try {
    let { postOfficeId } = req.params;
    let { phone, postOfficeName, address } = req.body;
    const logo = req?.file;

    let postOffice = await PostOffice.findOne({
      where: { postOfficeId: _.toNumber(postOfficeId) },
    });

    if (!postOffice?.toJSON()) {
      throw new Error(ERROR_POST_OFFICE_NOT_EXISTED);
    }

    await postOffice.update(
      removeEmptyFields({
        address,
        postOfficeName,
        phone,
        logo: logo ? `/resource/${logo.path}` : null,
      })
    );

    res.send({ result: "success", postOffice: postOffice });
  } catch (error) {
    next(error);
  }
}
