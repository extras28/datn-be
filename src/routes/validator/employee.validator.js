import { body } from "express-validator";
import { catchValidateError } from "./catch-validate-error.js";

export const createEmployeeValidator = [
  // body("email")
  //   .isEmail()
  //   .normalizeEmail()
  //   .withMessage("Thiếu email hoặc email không hợp lệ"),
  body("username")
    .notEmpty()
    .withMessage("Thiếu tên đăng nhập")
    .custom((value) => !/\s/.test(value))
    .withMessage("Tên đăng nhập không được chứa khoảng trắng"),
  body("fullname").notEmpty().withMessage("Thiếu thông tin tên shop"),
  body("phone")
    .notEmpty()
    .withMessage("Thiếu thông tin số điện thoại")
    .matches(/^(0|\+84)\d{9,10}$/)
    .withMessage("Số điện thoại không hợp lệ"),
  catchValidateError,
];
