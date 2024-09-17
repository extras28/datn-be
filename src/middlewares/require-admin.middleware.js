import { ADMIN } from "../shared/constants/account.constant.js";
import { ERROR_INSUFFICIENT_PERMISSIONS_TO_USE_THIS_FEATURE } from "../shared/errors/error.js";

export async function requiredAdminMiddleware(req, res, next) {
  try {
    const account = req.account;
    if (account.role !== ADMIN) {
      throw new Error(ERROR_INSUFFICIENT_PERMISSIONS_TO_USE_THIS_FEATURE);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}
