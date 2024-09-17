import axios from "axios";
import crypto from "crypto";

const baseUrl = "https://partner.test-stable.shopeemobile.com";

export async function shopAuth() {
  const timest = Math.floor(Date.now() / 1000);
  const host = baseUrl;
  const path = "/api/v2/shop/auth_partner";
  const redirectUrl = "https://falodating.com/";
  const partnerId = 1004018;
  const tmp =
    "2d4e537d78c6c39cdc93120cb967e725d4e6e5741ab5ce3545bd32926966af7d";
  const partnerKey = Buffer.from(tmp, "utf-8");
  const tmpBaseString = `${partnerId}${path}${timest}`;
  const baseString = Buffer.from(tmpBaseString, "utf-8");
  const hmac = crypto.createHmac("sha256", partnerKey);
  hmac.update(baseString);
  const sign = hmac.digest("hex");

  // Generate API
  const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timest}&sign=${sign}&redirect=${redirectUrl}`;
  console.log(url);
  return url;
}

export async function getTokenShopLevel({
  code,
  partnerId,
  tmpPartnerKey,
  shopId,
}) {
  const timest = Math.floor(Date.now() / 1000);
  const host = baseUrl;
  const path = "/api/v2/auth/token/get";
  const body = JSON.stringify({
    code: code,
    shop_id: shopId,
    partner_id: partnerId,
  });
  const tmpBaseString = `${partnerId}${path}${timest}`;
  const baseString = Buffer.from(tmpBaseString, "utf-8");
  const partnerKey = Buffer.from(tmpPartnerKey, "utf-8");
  const hmac = crypto.createHmac("sha256", partnerKey);
  hmac.update(baseString);
  const sign = hmac.digest("hex");
  const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timest}&sign=${sign}`;

  const headers = { "Content-Type": "application/json" };
  try {
    const response = await axios.post(url, body, { headers });
    const ret = response.data;
    const accessToken = ret.access_token;
    const newRefreshToken = ret.refresh_token;
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error("Error:", error.response.data);
    throw error;
  }
}

export async function getAccessTokenShopLevel({
  shopId,
  partnerId,
  tmpPartnerKey,
  refreshToken,
}) {
  const timest = Math.floor(Date.now() / 1000);
  const host = baseUrl;
  const path = "/api/v2/auth/access_token/get";
  const body = JSON.stringify({
    shop_id: shopId,
    refresh_token: refreshToken,
    partner_id: partnerId,
  });
  const tmpBaseString = `${partnerId}${path}${timest}`;
  const baseString = Buffer.from(tmpBaseString, "utf-8");
  const partnerKey = Buffer.from(tmpPartnerKey, "utf-8");
  const hmac = crypto.createHmac("sha256", partnerKey);
  hmac.update(baseString);
  const sign = hmac.digest("hex");
  const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timest}&sign=${sign}`;

  const headers = { "Content-Type": "application/json" };
  try {
    const response = await axios.post(url, body, { headers });
    const ret = response.data;
    console.log(ret);
    const accessToken = ret.access_token;
    const newRefreshToken = ret.refresh_token;
    return { accessToken: accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error("Error:", error.response?.data);
    throw error;
  }
}

export async function getSign({ partnerId, path }) {
  try {
    const timest = Math.floor(Date.now() / 1000);
    const partnerId = 1004018;
    const tmp =
      "2d4e537d78c6c39cdc93120cb967e725d4e6e5741ab5ce3545bd32926966af7d";
    const partnerKey = Buffer.from(tmp, "utf-8");
    const tmpBaseString = `${partnerId}${path}${timest}`;
    const baseString = Buffer.from(tmpBaseString, "utf-8");
    const hmac = crypto.createHmac("sha256", partnerKey);
    hmac.update(baseString);
    const sign = hmac.digest("hex");
    return sign;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

export async function getAccessTokenTemp() {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://open.shopee.com/opservice/api/v1/sandbox/test_tool/get_access_token?SPC_CDS_VER=2&partner_id=1004018&shop_id=106577&SPC_CDS=54995adf-2274-4acd-ae27-60a0f2f0aec6",
    headers: {
      Cookie:
        "SPC_CDS_VER=2; SPC_T_ID=mANGjUzLjNU+s/hcTMZb+4+cVasU8qEQ2IHodrVnXsHYN669lVIkk9t+iacxGBI5fu/4SWM+07QhLg2vYmAEj0cL5T8DM44AGLdvzbAIs0DnvL/fhieNRESCOtX7v4KrNMH/uXjy4eIHq1ku0ioY0eRBCiHAVaK304JfozcBKdY=; REC_T_ID=7e7210c2-d472-11ee-ae47-3e1529d6accb; SPC_R_T_ID=mANGjUzLjNU+s/hcTMZb+4+cVasU8qEQ2IHodrVnXsHYN669lVIkk9t+iacxGBI5fu/4SWM+07QhLg2vYmAEj0cL5T8DM44AGLdvzbAIs0DnvL/fhieNRESCOtX7v4KrNMH/uXjy4eIHq1ku0ioY0eRBCiHAVaK304JfozcBKdY=; SPC_R_T_IV=ZmtHOTZJaXJXSFpwTDZiZg==; SPC_T_IV=ZmtHOTZJaXJXSFpwTDZiZg==; SPC_B_SI=BFPUZQAAAABXbDh1NFJDaMJc3QEAAAAAWUl4dnBUMTA=; SPC_SI=BFPUZQAAAABXbDh1NFJDaMFc3QEAAAAAaWNnY2RnV0M=; SPC_F=YfPHybWaSz6sVytEVaQ7sXuuUag2r1lI; SPC_CLIENTID=WWZQSHliV2FTejZznulcwgqfnyrlsknn; SPC_B_EC=THJhZVhGSXppZEJ4ZUU2d561dbw5qD+X0+x0rr4qS5qUqaMMrhg0ne8Us8blK4X48/f6F2gkRCI96/MmD05xy1pzy2TEMPyZ8UvEWG33QKAHQnkVI6rT3oK3uWRzWvEHbnkAudtW2tKrhGU6SsKhI26hyVwgG1ZZT7eEtQbRD4WPDvOOmfYZCqV8hjtaS1dyvz0zQXcc5YfUSqbkY+XXOw==; session_id=Ley6oxB2KLzq3Yskl3atI5U4ClHDB0ZgIONAiIZ6hyM5UGAicLJRFdweknlvXUZ77EuYNUY3kei5CowsTvApkBfQAoLHBy7imkrTRwc1SSqN4ZNE4u9La5RYQ5LcXry952ddj9sqvIWTjwBKqiSpnc9QNFKhPFtiqUg6t8JmRnM%3D; SPC_CDS=76b84294-4ff1-422a-8c9f-c2ef896f444c",
    },
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}
