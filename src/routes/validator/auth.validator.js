import { body } from "express-validator";
import { ERROR_MISSING_PARAMETERS } from "../../shared/errors/error.js";
import { catchValidateError } from "./catch-validate-error.js";

export const signUpValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Thiếu email hoặc email không hợp lệ"),
  body("username")
    .notEmpty()
    .withMessage("Thiếu tên đăng nhập")
    .custom((value) => !/\s/.test(value))
    .withMessage("Tên đăng nhập không được chứa khoảng trắng"),
  body("fullname").notEmpty().withMessage("Thiếu thông tin tên shop"),
  catchValidateError,
];

export const signInValidator = [
  body("signInName").notEmpty().withMessage(ERROR_MISSING_PARAMETERS),
  body("password").notEmpty().withMessage("Thiếu thông tin mật khẩu"),
  catchValidateError,
];

export const changePassword = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Thiếu thông tin mật khẩu hiện tại"),
  body("newPassword").notEmpty().withMessage("Thiếu thông tin mật khẩu mới"),
  catchValidateError,
];

export const forgotPassword = [
  body("signInName").notEmpty().withMessage(ERROR_MISSING_PARAMETERS),
  catchValidateError,
];
