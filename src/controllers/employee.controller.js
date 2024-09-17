import _ from "lodash";
import { Op } from "sequelize";
import { Account } from "../models/account.model.js";
import { EMPLOYEE } from "../shared/constants/account.constant.js";
import {
  ERROR_EMPLOYEE_NOT_EXIST,
  ERROR_EXISTED_EMAIL,
  ERROR_INVALID_PARAMETERS,
} from "../shared/errors/error.js";
import {
  genSavedPassword,
  randomPassword,
} from "../shared/helpers/account.helper.js";
import {
  generateRandomStr,
  isValidNumber,
  removeEmptyFields,
} from "../shared/utils/utils.js";

export async function createEmployee(req, res, next) {
  try {
    const { email, username, phone, fullname, address, password } = req.body;
    const shopAdministrator = req.account;

    const avatar = req.file;
    // const plainFirstTimePassword = randomPassword();
    const salt = generateRandomStr(6);
    const passwordToSave = genSavedPassword(password, salt);

    await Account.create(
      removeEmptyFields({
        email: email,
        adminAccountId: shopAdministrator.accountId,
        username: username,
        fullname: fullname,
        address: address,
        password: passwordToSave,
        firstTimePassword: passwordToSave,
        salt: salt,
        logo: avatar ? `/resource/${avatar.path}` : null,
        role: EMPLOYEE,
        phone: phone,
      })
    );

    // sendMail(
    //   email,
    //   `[${shopAdministrator?.fullname}] Tài khoản nhân viên`,
    //   `Bạn vừa được cấp tài khoản nhân viên của shop ${shopAdministrator?.fullname} với emai: ${email}, mật khẩu của bạn là: \n ${plainFirstTimePassword}`
    // );

    res.send({ result: "success" });
  } catch (error) {
    if (error.message === "Validation error") {
      error.message = ERROR_EXISTED_EMAIL;
    }
    next(error);
  }
}

export async function getListEmployee(req, res, next) {
  try {
    let { q, limit, page } = req.query;
    q = q ?? "";
    const account = req.account;

    let conditions = {
      [Op.or]: [
        { username: { [Op.like]: `%${q}%` } },
        { fullname: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { phone: { [Op.like]: `%${q}%` } },
        { address: { [Op.like]: `%${q}%` } },
      ],
      [Op.and]: [{ adminAccountId: account.accountId }],
    };

    let employees;

    limit = _.toNumber(limit);
    page = _.toNumber(page);
    if (!isValidNumber(limit) || !isValidNumber(page)) {
      page = undefined;
      limit = undefined;
      employees = await Account.findAndCountAll({
        attributes: { exclude: ["password", "salt", "firstTimePassword"] },
        where: conditions,
      });
    } else {
      employees = await Account.findAndCountAll({
        attributes: { exclude: ["password", "salt", "firstTimePassword"] },
        where: conditions,
        limit,
        offset: limit * page,
      });
    }

    res.send({
      result: "success",
      page,
      total: employees.count,
      count: employees.rows.length,
      employees: employees.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeDetail(req, res, next) {
  try {
    let { employeeId } = req.params;
    let employee = await Account.findOne({
      attributes: { exclude: ["password", "salt", "firstTimePassword"] },
      where: { accountId: _.toNumber(employeeId) },
    });

    if (!employee?.toJSON()) {
      throw new Error(ERROR_EMPLOYEE_NOT_EXIST);
    }

    res.send({ result: "success", employee: employee });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    let { employeeId } = req.params;
    let { phone, fullname, address, username, password, email } = req.body;
    const avatar = req?.file?.path;

    let employee = await Account.findOne({
      attributes: { exclude: ["password", "salt", "firstTimePassword"] },
      where: { accountId: _.toNumber(employeeId) },
    });

    if (!employee?.toJSON()) {
      throw new Error(ERROR_EMPLOYEE_NOT_EXIST);
    }

    // if (!!avatar && avatar != employee.avatar) {
    //   removePrivateFile(employee.avatar);
    // } else {
    //   avatar = employee.avatar;
    // }
    let salt = generateRandomStr(6);

    let savedPassword = genSavedPassword(password, salt);

    await employee.update(
      removeEmptyFields({
        email,
        salt,
        phone,
        fullname,
        address,
        username,
        password: savedPassword,
        logo: avatar ? `/resource/${avatar}` : null,
      })
    );

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    let { accountIds } = req.body;

    if (!_.isArray(accountIds)) throw new Error(ERROR_INVALID_PARAMETERS);

    let deleteCount = await Account.destroy({
      where: { accountId: { [Op.in]: accountIds } },
    });
    res.send({ result: "success", deleteCount });
  } catch (error) {
    next(error);
  }
}
