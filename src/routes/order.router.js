import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import * as orderValidator from "./validator/order.validator.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { uploadPublicImage } from "../middlewares/file-upload.middleware.js";
export const orderRouter = Router();

orderRouter.get(
  "/order/find",
  authorizationMiddleware,
  orderController.getListOrder
);

orderRouter.post(
  "/order/create",
  authorizationMiddleware,
  uploadPublicImage.single("image"),
  orderValidator.createOrderValidator,
  orderController.createOrder
);

orderRouter.put(
  "/order/update",
  authorizationMiddleware,
  uploadPublicImage.single("image"),
  orderController.updateOrder
);

orderRouter.delete(
  "/order/delete",
  authorizationMiddleware,
  orderController.deleteOrder
);

orderRouter.post(
  "/order/bulk-create",
  authorizationMiddleware,
  uploadPublicImage.array("images"),
  orderController.bulkCreateOrder
);

orderRouter.put(
  "/order/bulk-update",
  authorizationMiddleware,
  uploadPublicImage.array("images"),
  orderController.bulkUpdate
);

orderRouter.get(
  "/order/get-total-by-status",
  authorizationMiddleware,
  orderController.getTotalByStatus
);

orderRouter.post(
  "/order/update-scan-employee",
  // authorizationMiddleware,
  orderController.updateScanEmployee
);
