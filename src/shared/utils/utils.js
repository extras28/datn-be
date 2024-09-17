import _ from "lodash";
import crypto from "crypto";
import moment from "moment";
import { ORDER_STATUS } from "../constants/order.constant.js";
import fs from "fs";

/**
 *
 * @param {*} str
 * @returns
 */
export function isVietnamese(str) {
  str = _.toString(str).toLowerCase();

  if (/Á|À|Ã|Ạ|Ả|Â|Ấ|Ầ|Ẫ|Ẩ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ|Ẳ/g.test(str)) return true;
  if (/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ|ẳ/g.test(str)) return true;
  if (/É|È|Ẽ|Ẹ|Ẻ|Ê|Ế|Ề|Ễ|Ệ|Ể/g.test(str)) return true;
  if (/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g.test(str)) return true;
  if (/Í|Ì|Ĩ|Ị|Ỉ/g.test(str)) return true;
  if (/ì|í|ị|ỉ|ĩ/g.test(str)) return true;
  if (/Ó|Ò|Õ|Ọ|Ỏ|Ô|Ố|Ồ|Ỗ|Ộ|Ổ|Ơ|Ớ|Ờ|Ỡ|Ợ|Ở/g.test(str)) return true;
  if (/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g.test(str)) return true;
  if (/Ú|Ù|Ũ|Ụ|Ủ|Ư|Ứ|Ừ|Ữ|Ự|Ử/g.test(str)) return true;
  if (/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g.test(str)) return true;
  if (/Y|Ý|Ỳ|Ỹ|Ỵ|Ỷ/g.test(str)) return true;
  if (/ỳ|ý|ỵ|ỷ|ỹ/g.test(str)) return true;
  if (/Đ/g.test(str)) return true;
  if (/đ/g.test(str)) return true;
  // Some system encode vietnamese combining accent as individual utf-8 characters
  if (/\u0300|\u0301|\u0303|\u0309|\u0323/g.test(str)) return true; // Huyền sắc hỏi ngã nặng
  if (/\u02C6|\u0306|\u031B/g.test(str)) return true; // Â, Ê, Ă, Ơ, Ư

  return false;
}

/**
 * check if is stringify by JSON.stringify
 * @param {string} str
 * @returns
 */
export function isJSONStringified(str) {
  if (typeof str !== "string") return false;
  if (this.isValidNumber(str)) return false;

  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 *
 * @param {*} email
 * @returns
 */
export function isValidEmail(email) {
  let regExp = /^\S+@\S+\.\S+$/;

  return regExp.test(email) /* && /[a-zA-Z]/.test(email.split('@')[0]) */;
}

/**
 *
 * @param {*} str
 * @returns
 */
export function hashSHA256(str) {
  str = _.toString(str);
  return crypto
    .createHash("sha256")
    .update(str, "utf-8")
    .digest("hex")
    .toString();
}

/**
 *
 * @param {*} size
 * @returns
 */
export function generateRandomStr(size = 20) {
  return crypto.randomBytes(size).toString("hex");
}

/**
 *
 * @returns
 */
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000); // Divide by 1000 to convert milliseconds to seconds
}

/**
 * Check if is number, both in string format (`'5'`) or number format (`5`). Return false if is NaN, empty, null, undefined...
 * @param {*} param
 * @return {param is number}
 */
export function isValidNumber(param) {
  if (
    ((!_.isString(param) || _.isEmpty(param)) && !_.isNumber(param)) ||
    _.isNull(param) ||
    _.isUndefined(param)
  ) {
    return false;
  }
  return !isNaN(param) && isFinite(param);
}

/**
 *
 * @param {*} obj
 * @returns
 */
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 *
 * @param {*} obj
 * @returns
 */
export function removeEmptyFields(obj) {
  for (var key in obj) {
    if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      removeEmptyFields(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
  return obj;
}

/**
 *
 * @param {*} fromDateStr
 * @param {*} toDateStr
 * @returns
 */
export function getDateTimeLabels(fromDateStr, toDateStr) {
  const fromDate = moment(fromDateStr).startOf("day");
  const toDate = moment(toDateStr).endOf("day");

  const duration = moment.duration(toDate.diff(fromDate));
  const numberOfDays = Math.ceil(duration.asDays());

  const isoStringsArray = [];

  for (let i = 0; i < numberOfDays; i++) {
    const dateString = fromDate.clone().add(i, "days").toISOString();
    isoStringsArray.push(dateString);
  }

  return isoStringsArray;
}

/**
 *
 * @param {*} isoString
 * @returns
 */
export function getStartAndEndOfDayISOString(isoString) {
  const date = moment(isoString);

  // Get the start of the day
  const startOfDate = date.startOf("day").toISOString();

  // Get the end of the day
  const endOfDate = date.endOf("day").toISOString();

  return { startOfDate, endOfDate };
}

/**
 *
 * @param {*} name
 * @returns
 */
export function formatPostOfficeName(name) {
  switch (name) {
    case "J&T Express":
      return "J&T";
    case "SPX Express":
      return "SPX";
    case "Giao Hàng Nhanh":
      return "GHN";
    case "Giao hàng tiết kiệm":
      return "GHTK";
    case "Vietnam Post":
      return "VP";

    default:
      return name;
      break;
  }
}

/**
 *
 * @param {*} status
 * @returns
 */
export function getOrderStatusText(status) {
  switch (status) {
    case ORDER_STATUS.SCANNED:
      return "Đã đóng gói";

    case ORDER_STATUS.CANCELED:
      return "Huỷ hàng";

    case ORDER_STATUS.HANDED_OVER:
      return "Vận chuyển";

    case ORDER_STATUS.READY_TO_SHIP:
      return "Sẵn sàng giao";

    case ORDER_STATUS.RETURNED:
      return "Hoàn hàng";

    default:
      break;
  }
}

/**
 *
 * @param {*} param0
 * @returns
 */
export function getErrorMessageExistedOrder({
  orderCode,
  newStatus,
  existedStatus,
}) {
  const newStatusText = getOrderStatusText(newStatus);
  const existedStatusText = getOrderStatusText(existedStatus);

  if (newStatus == existedStatus) {
    return `Đơn hàng với mã vận đơn ${orderCode} đã tồn tại trên hệ thống với trạng thái ${existedStatusText}.`;
  }

  return `Đơn hàng với mã vận đơn ${orderCode} đã tồn tại trên hệ thống với trạng thái ${existedStatusText}, bạn có muốn cập nhật trạng thái đơn hàng thành ${newStatusText} hay không?`;
}

/**
 *
 * @param {*} amount
 * @returns
 */
export function getErrorMessageExistedOrderWithAmount(amount) {
  return `Hệ thống phát hiện ${amount} đơn hàng đã tồn tại. Các đơn hàng mới đã được thêm vào hệ thống. Bạn có muốn cập nhật thông tin cho các đơn hàng đã bị trùng hay không ?`;
}

/**
 *
 * @param {*} filePath
 */
export async function deleteImageFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`File at ${filePath} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting file at ${filePath}:`, error);
  }
}
