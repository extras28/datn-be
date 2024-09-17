import jwt from "jsonwebtoken";
import _ from "lodash";
import { getJwtAccountAttributes } from "./account.helper.js";
import moment from "moment";

export const jwtHelper = {
  /**
   *
   * @param {*} account
   * @param {*} rememberMe
   * @returns
   */
  genAccountAccessToken: (account, rememberMe = false) => {
    account = _.pick(account, getJwtAccountAttributes());
    const token = jwt.sign(account, process.env.JWT_SECRET, {
      // expiresIn: !!rememberMe ? "90 days" : "48h",
      expiresIn: !!rememberMe ? "90 days" : "30 days",
    });
    return token;
  },

  /**
   *
   * @param {*} token
   * @returns
   */
  verifyJWTToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   *
   * @param {*} token
   * @returns
   */
  decodeJwtToken: (token) => {
    if (!jwtHelper.verifyJWTToken(token)) return undefined;
    return jwt.decode(token, {});
  },

  /**
   *
   * @param {*} token
   * @returns
   */
  isJWTTokenExpired: (token) => {
    if (jwtHelper.verifyJWTToken(token)) {
      let decoded = jwtHelper.decodeJwtToken(token);
      const { exp, iat } = decoded;
      const now = Date.now();

      if (!exp) return moment().diff(iat * 1000, "days") <= 15; // no exp time but 15 days max
      return parseInt(exp) * 1000 <= now;
    }
  },
};
