import { body } from "express-validator";
import { catchValidateError } from "./catch-validate-error.js";
import { ERROR_EMPTY_POST_OFFICE_NAME } from "../../shared/errors/error.js";

export const create = [
  body("postOfficeName").notEmpty().withMessage(ERROR_EMPTY_POST_OFFICE_NAME),
  catchValidateError,
];
