import { Router } from "express";
import * as accountController from "../controllers/account.controller.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { requiredAdminMiddleware } from "../middlewares/require-admin.middleware.js";
import * as accountValidator from "./validator/account.validator.js";
import { uploadPublicImage } from "../middlewares/file-upload.middleware.js";

export const accountRouter = Router();

accountRouter.get(
  "/account/detail",
  authorizationMiddleware,
  accountController.getAccountInformation
);

accountRouter.put(
  "/account/update",
  authorizationMiddleware,
  requiredAdminMiddleware,
  uploadPublicImage.single("logo"),
  accountValidator.updateAccountValidator,
  accountController.update
);
