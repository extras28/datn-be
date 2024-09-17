import { ERROR_INTERNAL, REQ_ERROR_CODE } from "../shared/errors/error.js";
import { isVietnamese } from "../shared/utils/utils.js";

export function errorHandlerMiddleware(error, req, res, next) {
  console.warn("[ERROR]", req.path, error.stack, error.message);

  if (res.writableEnded) {
    console.warn(
      "[HEADS UP!!] THIS ERROR occurred after response",
      error.stack,
      error.message
    );
    return;
  }

  if (!isVietnamese(error.message)) {
    error.message = ERROR_INTERNAL;
  }

  error.message = error.message?.includes("\n")
    ? error.message?.split(",\n")
    : error.message;

  res
    .status(error.status ?? REQ_ERROR_CODE)
    .send({ result: "failed", reason: error.message });
}

export class CustomError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
