import { Router } from "express";
import { authRouter } from "./auth.router.js";
import { addressRouter } from "./address.router.js";
import { accountRouter } from "./account.router.js";
import { employeeRouter } from "./employee.router.js";
import { orderRouter } from "./order.router.js";
import { postOfficeRouter } from "./post-office.router.js";
import { goodsHandoverReceiptRouter } from "./goods-handover-receipt.router.js";
import { statisticRouter } from "./statistic.router.js";
import { shipperRouter } from "./shipper.router.js";

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(addressRouter);
apiRouter.use(accountRouter);
apiRouter.use(employeeRouter);
apiRouter.use(orderRouter);
apiRouter.use(postOfficeRouter);
apiRouter.use(goodsHandoverReceiptRouter);
apiRouter.use(statisticRouter);
apiRouter.use(shipperRouter);
