import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import { uploadPublicImage } from "../middlewares/file-upload.middleware.js";
import * as authValidator from "./validator/auth.validator.js";

export const authRouter = Router();

authRouter.post(
  "/auth/sign-up",
  uploadPublicImage.single("logo"),
  authValidator.signUpValidator,
  authController.signUp
);

authRouter.post(
  "/auth/sign-in",
  authValidator.signInValidator,
  authController.signIn
);

authRouter.post("/log-out", authorizationMiddleware, authController.logOut);

authRouter.post(
  "/auth/change-password",
  authorizationMiddleware,
  authValidator.changePassword,
  authController.changePassword
);

authRouter.post(
  "/auth/forgot-password",
  authValidator.forgotPassword,
  authController.forgotPassword
);
