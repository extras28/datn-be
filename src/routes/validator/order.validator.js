import { body } from "express-validator";
import { ERROR_EMPTY_ORDER_CODE } from "../../shared/errors/error.js";
import { catchValidateError } from "./catch-validate-error.js";

export const createOrderValidator = [
  body("orderCode").notEmpty().withMessage(ERROR_EMPTY_ORDER_CODE),
  catchValidateError,
];
