import { mkdir, rm } from "fs/promises";
import multer from "multer";
import { extname, join } from "path";
import { v4 } from "uuid";
import { ERROR_INVALID_IMAGE_FORMAT } from "../shared/errors/error.js";

const publicStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dir = join(process.env.PUBLIC_DIR, file.fieldname);
    await mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, v4() + extname(file.originalname));
  },
});

const privateStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dir = join(process.env.STORAGE_DIR, file.fieldname);
    await mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const uploadPublicImage = multer({
  storage: publicStorage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  // fileFilter: imageFileFilter,
});

export const uploadPrivateRecourses = multer({
  storage: privateStorage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

export const uploadWithoutStoreFile = (fileFilter) =>
  multer({
    fileFilter,
  });

export const removePrivateFile = async (fileName) => {
  await rm(fileName, { recursive: true });
};

// -------------------------------------------------

function imageFileFilter(req, file, cb) {
  const acceptExt = [".png", ".jpg", ".jpeg", ".svg"];
  if (acceptExt.includes(extname(file.originalname))) return cb(null, true);
  cb(new Error(ERROR_INVALID_IMAGE_FORMAT));
}
