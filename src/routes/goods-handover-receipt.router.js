import { Router } from "express";
import * as goodsHandoverReceiptController from "../controllers/goods-handover-receipt.controller.js";
import * as goodsHandoverReceiptValidator from "./validator/goods-handover-receipt.validator.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { uploadPublicImage } from "../middlewares/file-upload.middleware.js";

export const goodsHandoverReceiptRouter = Router();

goodsHandoverReceiptRouter.post(
  "/receipt/create",
  authorizationMiddleware,
  uploadPublicImage.fields([
    {
      name: "package",
      maxCount: 1,
    },
    {
      name: "signature",
      maxCount: 1,
    },
  ]),
  goodsHandoverReceiptValidator.create,
  goodsHandoverReceiptController.create
);

goodsHandoverReceiptRouter.get(
  "/receipt/find",
  authorizationMiddleware,
  goodsHandoverReceiptController.getListReceipt
);

goodsHandoverReceiptRouter.put(
  "/receipt/update/:id",
  authorizationMiddleware,
  uploadPublicImage.fields([
    {
      name: "package",
      maxCount: 1,
    },
    {
      name: "signature",
      maxCount: 1,
    },
  ]),
  goodsHandoverReceiptController.update
);

goodsHandoverReceiptRouter.delete(
  "/receipt/delete",
  authorizationMiddleware,
  goodsHandoverReceiptController.deleteReceipt
);

goodsHandoverReceiptRouter.get(
  "/receipt/copy/:id",
  authorizationMiddleware,
  goodsHandoverReceiptController.copyReceiptContent
);
