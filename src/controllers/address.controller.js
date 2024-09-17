import axios from "axios";
import fs from "fs";
import provinces from "../assets/provinces.json" assert { type: "json" };
import districts from "../assets/districts.json" assert { type: "json" };
import wards from "../assets/wards.json" assert { type: "json" };
import { Province } from "../models/province.model.js";
import { District } from "../models/district.model.js";
import { Ward } from "../models/ward.model.js";

export async function createNationalInfor(req, res, next) {
  try {
    await Province.bulkCreate(provinces.provinces);
    await District.bulkCreate(districts.districts);
    await Ward.bulkCreate(wards.wards);
    res.send({ result: "success" });
  } catch (error) {
    next(error);
  }
}

export async function getProvince(req, res, next) {
  try {
    const provinces = await Province.findAll();

    res.send({ result: "success", provinces });
  } catch (error) {
    next(error);
  }
}

export async function getDistrict(req, res, next) {
  try {
    const { provinceId } = req.params;

    const districts = await District.findAll({
      where: { provinceId: provinceId },
    });

    res.send({ result: "success", districts });
  } catch (error) {
    next(error);
  }
}

export async function getWard(req, res, next) {
  try {
    const { districtId } = req.params;

    const wards = await Ward.findAll({
      where: { districtId: districtId },
    });

    res.send({ result: "success", wards });
  } catch (error) {
    next(error);
  }
}
