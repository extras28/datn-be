import { Router } from "express";
import * as statisticController from "../controllers/statistic.controller.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";

export const statisticRouter = Router();

statisticRouter.get(
  "/statistic/all",
  authorizationMiddleware,
  statisticController.getNumberOfOrderByDate
);

statisticRouter.get(
  "/statistic/handed-over",
  authorizationMiddleware,
  statisticController.getNumberOfHandedOverOrderByDate
);

statisticRouter.get(
  "/statistic/post-office",
  authorizationMiddleware,
  statisticController.getStatisticOrderByPostOffice
);

statisticRouter.get(
  "/statistic/order-by-month",
  authorizationMiddleware,
  statisticController.getStatisticOfThisMonth
);

statisticRouter.get(
  "/statistic/order-by-employee",
  authorizationMiddleware,
  statisticController.getStatisticByEmployee
);
