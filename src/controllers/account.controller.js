import { removePrivateFile } from "../middlewares/file-upload.middleware.js";
import { Account } from "../models/account.model.js";
import { AccessToken } from "../models/access-token.model.js";

export async function getAccountInformation(req, res, next) {
  try {
    const accountId = req.account.accountId;

    const account = await Account.findOne({
      attributes: { exclude: ["password", "salt", "firstTimePassword"] },
      where: { accountId: accountId },
    });

    const accessToken = await AccessToken.findOne({
      where: { accountId: accountId },
    });

    res.send({
      result: "success",
      account: account,
      accessToken: req.accessToken,
      accessTokenExpireDate: accessToken.expireAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { fullname, address, phone } = req.body;
    let logo = req.file.path;

    const account = await Account.findOne({
      attributes: {
        exclude: ["password", "salt", "firstTimePassword"],
      },
      where: { accountId: req.account.accountId },
    });

    if (!!logo && logo != account.logo) {
      removePrivateFile(account.logo);
    } else {
      logo = account.logo;
    }

    await account.update({
      fullname,
      address,
      phone,
      logo: `/resource/${logo.path}`,
    });

    res.send({ result: "success", account: account });
  } catch (error) {
    next(error);
  }
}
