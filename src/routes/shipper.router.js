import { Router } from "express";
import * as shipperController from "../controllers/shipper.controller.js";
import * as shipperValidator from "./validator/shipper.validator.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { requiredAdminMiddleware } from "../middlewares/require-admin.middleware.js";
import { uploadPublicImage } from "../middlewares/file-upload.middleware.js";

export const shipperRouter = Router();

shipperRouter.get(
  "/shipper/find",
  authorizationMiddleware,
  shipperController.getListShipper
);

shipperRouter.post(
  "/shipper/create",
  uploadPublicImage.single("avatar"),
  authorizationMiddleware,
  requiredAdminMiddleware,
  shipperController.create
);

shipperRouter.put(
  "/shipper/update/:shipperId",
  uploadPublicImage.single("avatar"),
  authorizationMiddleware,
  requiredAdminMiddleware,
  shipperController.updateShipper
);

shipperRouter.delete(
  "/shipper/delete",
  authorizationMiddleware,
  shipperController.deleteShipper
);
