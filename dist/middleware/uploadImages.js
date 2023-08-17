var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import sharp from "sharp";
import path from "path";
import FancyError from '../utils/FancyError.js';
const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSufix + ".jpeg");
    }
});
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new FancyError("Unsupported file format", 400));
    }
};
export const productImgResize = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files)
        return next();
    const files = req.files;
    yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        yield sharp(file === null || file === void 0 ? void 0 : file.path)
            .resize(300, 300)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`dist/public/images/products/${file === null || file === void 0 ? void 0 : file.filename}`);
        fs.unlinkSync(`dist/public/images/products/${file === null || file === void 0 ? void 0 : file.filename}`);
    })));
    next();
});
export const blogImgResize = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files)
        return next();
    const files = req.files;
    yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        yield sharp(file === null || file === void 0 ? void 0 : file.path)
            .resize(300, 300)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`dist/public/images/blogs/${file === null || file === void 0 ? void 0 : file.filename}`);
        fs.unlinkSync(`dist/public/images/blogs/${file === null || file === void 0 ? void 0 : file.filename}`);
    })));
    next();
});
export const uploadPhoto = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fieldSize: 6 * 1000 * 1000 }
});
