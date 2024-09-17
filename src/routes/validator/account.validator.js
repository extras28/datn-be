import { body } from "express-validator";
import { catchValidateError } from "./catch-validate-error.js";

export const updateAccountValidator = [
  body("fullname").notEmpty().withMessage("Thiếu thông tin tên shop"),
  catchValidateError,
];
