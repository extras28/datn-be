import { isJSONStringified } from "../shared/utils/utils";

export async function parseJson(req, res, next) {
  if (req.body) {
    for (let [key, value] of Object.entries(req.body)) {
      if (isJSONStringified(value)) {
        req.body[key] = JSON.parse(value);
      }
    }
  }

  if (req.query) {
    for (let [key, value] of Object.entries(req.query)) {
      if (isJSONStringified(value)) {
        req.query[key] = JSON.parse(value);
      }
    }
  }

  next();
}
