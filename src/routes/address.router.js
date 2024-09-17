import { Router } from "express";

export const addressRouter = Router();
import * as addressController from "../controllers/address.controller.js";

addressRouter.get("/address", addressController.createNationalInfor);

addressRouter.get("/provinces", addressController.getProvince);
addressRouter.get("/districts/:provinceId", addressController.getDistrict);
addressRouter.get("/wards/:districtId", addressController.getWard);
