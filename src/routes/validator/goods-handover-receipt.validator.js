import { body } from "express-validator";
import { catchValidateError } from "./catch-validate-error.js";
import { ERROR_EMPTY_POST_OFFICE_ID } from "../../shared/errors/error.js";

export const create = [
  body("postOfficeId").notEmpty().withMessage(ERROR_EMPTY_POST_OFFICE_ID),
  catchValidateError,
];
