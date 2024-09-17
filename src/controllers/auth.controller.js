import moment from "moment";
import { Account } from "../models/account.model.js";
import {
  ERROR_EXISTED_EMAIL,
  ERROR_NEW_PASSWORD_MUST_NOT_BE_SAME,
  ERROR_USER_NOT_FOUND,
  ERROR_WRONG_PASSWORD,
} from "../shared/errors/error.js";
import {
  genSavedPassword,
  randomPassword,
  validatePassword,
} from "../shared/helpers/account.helper.js";
import { jwtHelper } from "../shared/helpers/jwt.helper.js";
import { sendMail } from "../shared/helpers/nodemailer.helper.js";
import {
  generateRandomStr,
  hashSHA256,
  isValidEmail,
} from "../shared/utils/utils.js";
import { DATETIME_FORMAT } from "../shared/constants/app.constant.js";
import { AccessToken } from "../models/access-token.model.js";

export async function signUp(req, res, next) {
  try {
    const { email, username, fullname, address, phone } = req.body;
    const logo = req.file;

    const plainFirstTimePassword = randomPassword();
    const salt = generateRandomStr(6);
    const passwordToSave = genSavedPassword(
      hashSHA256(plainFirstTimePassword),
      salt
    );

    await Account.create({
      email: email,
      username: username,
      fullname: fullname,
      address: address,
      password: passwordToSave,
      firstTimePassword: passwordToSave,
      salt: salt,
      logo: logo ? `/resource/${logo?.path}` : null,
      role: "ADMIN",
      phone: phone,
    });

    sendMail(
      email,
      `[eShip] Tài khoản chủ shop`,
      `Bạn vừa đăng ký tài khoản trên hệ thống eShip với emai: ${email}, mật khẩu của bạn là: \n ${plainFirstTimePassword}`
    );

    res.send({ result: "success" });
  } catch (error) {
    if (error.message === "Validation error") {
      error.message = ERROR_EXISTED_EMAIL;
    }
    next(error);
  }
}

export async function signIn(req, res, next) {
  try {
    let { signInName, password, remember } = req.body;
    let email = "";
    let username = "";

    if (isValidEmail(signInName)) {
      email = signInName;
    } else {
      username = signInName;
    }

    let account = await Account.findOne({
      where: [!!username ? { username } : {}, !!email ? { email } : {}],
    });

    if (!account) throw new Error(ERROR_USER_NOT_FOUND);

    if (!validatePassword(password, account.salt, account.password)) {
      throw new Error(ERROR_WRONG_PASSWORD);
    }

    req.account = account;

    let accessToken = jwtHelper.genAccountAccessToken(
      { ...account.toJSON() },
      remember
    );

    let expireAt = remember
      ? moment().add(14, "days")
      : moment().add(48, "hours");

    await AccessToken.create({
      accessToken: hashSHA256(accessToken),
      accountId: account.accountId,
      expireAt,
    });

    account = account.toJSON();

    const firstTimeLogIn =
      account.firstTimePassword === genSavedPassword(password, account.salt);

    delete account.password;
    delete account.salt;
    delete account.firstTimePassword;

    res.send({
      result: "success",
      account,
      accessToken,
      accessTokenExpireDate: expireAt,
      firstTimeLogIn,
    });
  } catch (error) {
    next(error);
  }
}

export async function logOut(req, res, next) {
  try {
    let accessToken = req.accessToken;
    if (accessToken) {
      await AccessToken.destroy({
        where: {
          accessToken: hashSHA256(accessToken),
          accountId: req.account.accountId,
        },
      });
    }

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    let { oldPassword, newPassword } = req.body;

    let account = await Account.findOne({
      where: { accountId: req.account.accountId },
    });

    if (!validatePassword(oldPassword, account.salt, account.password)) {
      throw new Error(ERROR_WRONG_PASSWORD);
    }

    if (newPassword === oldPassword) {
      throw new Error(ERROR_NEW_PASSWORD_MUST_NOT_BE_SAME);
    }

    let salt = generateRandomStr(6);

    let savedPassword = genSavedPassword(newPassword, salt);

    await account.update({ password: savedPassword, salt });

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { signInName } = req.body;
    let email = "";
    let username = "";

    if (isValidEmail(signInName)) {
      email = signInName;
    } else {
      username = signInName;
    }

    let account = await Account.findOne({
      where: [!!username ? { username } : {}, !!email ? { email } : {}],
    });

    if (!account) throw new Error(ERROR_USER_NOT_FOUND);

    let resetPassword = randomPassword();
    const passwordToSave = genSavedPassword(
      hashSHA256(resetPassword),
      account.toJSON().salt
    );

    sendMail(
      account.toJSON().email,
      `[eShip]Quên mật khẩu`,
      `mật khẩu của bạn là:\n ${resetPassword}`
    );

    await account.update({ password: passwordToSave });

    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}
