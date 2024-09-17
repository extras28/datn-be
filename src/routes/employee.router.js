import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { uploadPublicImage } from "../middlewares/file-upload.middleware.js";
import { requiredAdminMiddleware } from "../middlewares/require-admin.middleware.js";
import * as employeeValidator from "./validator/employee.validator.js";

export const employeeRouter = Router();

employeeRouter.post(
  "/employee/create",
  authorizationMiddleware,
  requiredAdminMiddleware,
  uploadPublicImage.single("avatar"),
  employeeValidator.createEmployeeValidator,
  employeeController.createEmployee
);

employeeRouter.get(
  "/employee/find",
  authorizationMiddleware,
  requiredAdminMiddleware,
  employeeController.getListEmployee
);

employeeRouter.get(
  "/employee/detail/:employeeId",
  authorizationMiddleware,
  employeeController.getEmployeeDetail
);

employeeRouter.put(
  "/employee/update/:employeeId",
  authorizationMiddleware,
  requiredAdminMiddleware,
  uploadPublicImage.single("avatar"),
  employeeController.updateEmployee
);

employeeRouter.delete(
  "/employee/delete",
  authorizationMiddleware,
  requiredAdminMiddleware,
  employeeController.deleteEmployee
);
