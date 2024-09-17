import { body } from "express-validator";
import { catchValidateError } from "./catch-validate-error.js";
import {
  ERROR_EMPTY_SHIPPER_NAME,
  ERROR_EMPTY_SHIPPER_PHONE,
} from "../../shared/errors/error.js";

export const create = [
  body("shipperName").notEmpty().withMessage(ERROR_EMPTY_SHIPPER_NAME),
  body("shipperPhone").notEmpty().withMessage(ERROR_EMPTY_SHIPPER_PHONE),
  catchValidateError,
];
