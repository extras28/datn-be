import { validationResult } from "express-validator";

export function catchValidateError(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new Error(
      errors.array().map((err, index) => {
        if (index === 0) {
          return err.msg;
        } else {
          return "\n" + err.msg;
        }
      })
    );
  }

  next();
}
