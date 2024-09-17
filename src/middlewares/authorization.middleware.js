import moment from "moment";
import { AccessToken } from "../models/access-token.model.js";
import { Account } from "../models/account.model.js";
import { ADMIN } from "../shared/constants/account.constant.js";
import {
  ERROR_PERMISSION_DENIED,
  ERROR_TOKEN_EXPIRED,
} from "../shared/errors/error.js";
import { jwtHelper } from "../shared/helpers/jwt.helper.js";
import { hashSHA256 } from "../shared/utils/utils.js";

const TAG = "[authorization.middleware]";

export async function authorizationMiddleware(req, res, next) {
  let tokenStr = req.headers["authorization"];
  let accessToken =
    tokenStr != null ? tokenStr.match("(?<=Bearer).*$")?.[0] : null;

  console.log(
    TAG,
    `${moment().format("DD/MM/YYYY HH:mm")} [HTTP] Processing request ${
      req.originalUrl
    } IP: ${
      req.header("x-forwarded-for") != null
        ? req.header("x-forwarded-for")
        : req.connection.remoteAddress
    } token:${accessToken}`
  );

  if (accessToken) {
    accessToken = accessToken.trim();

    let account = jwtHelper.decodeJwtToken(accessToken);

    if (!jwtHelper.verifyJWTToken(accessToken)) {
      let error = new Error(ERROR_PERMISSION_DENIED);
      error.status = 401;
      return next(error);
    }

    if (jwtHelper.isJWTTokenExpired(accessToken)) {
      let error = new Error(ERROR_TOKEN_EXPIRED);
      AccessToken.destroy({
        where: {
          accessToken: hashSHA256(accessToken),
          accountId: account.accountId,
        },
      });
      error.status = 401;
      return next(error);
    }

    if (
      !(await AccessToken.findOne({
        where: {
          accessToken: hashSHA256(accessToken),
          accountId: account.accountId,
        },
      }))
    ) {
      let error = new Error(ERROR_TOKEN_EXPIRED);
      error.status = 401;
      return next(error);
    }

    const accountInDB = await Account.findOne({
      attributes: {
        exclude: ["password", "salt", "firstTimePassword"],
      },
      where: { accountId: account.accountId },
    });

    let shopId =
      accountInDB.role == ADMIN
        ? accountInDB.accountId
        : accountInDB.adminAccountId;

    req.account = {
      ...accountInDB.toJSON(),
      shopId: shopId,
    };

    req.accessToken = accessToken;
  } else {
    let error = new Error(ERROR_PERMISSION_DENIED);
    error.status = 403;
    return next(error);
  }

  next();
}
