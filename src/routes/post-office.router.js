import { Router } from "express";
import * as postOfficeController from "../controllers/post-office.controller.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { requiredAdminMiddleware } from "../middlewares/require-admin.middleware.js";
import { uploadPublicImage } from "../middlewares/file-upload.middleware.js";
import * as postOfficeValidator from "./validator/post-office.validator.js";

export const postOfficeRouter = Router();

postOfficeRouter.post(
  "/post-office/create",
  authorizationMiddleware,
  requiredAdminMiddleware,
  uploadPublicImage.single("logo"),
  postOfficeValidator.create,
  postOfficeController.create
);

postOfficeRouter.put(
  "/post-office/update/:postOfficeId",
  authorizationMiddleware,
  requiredAdminMiddleware,
  uploadPublicImage.single("logo"),
  postOfficeController.updatePostOffice
);

postOfficeRouter.get(
  "/post-office/find",
  authorizationMiddleware,
  postOfficeController.getListPostOffice
);

postOfficeRouter.delete(
  "/post-office/delete",
  authorizationMiddleware,
  postOfficeController.deletePostOffice
);
