import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import sharp from "sharp"
import path from "path"
import FancyError from '../utils/FancyError.js';

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'))
    },
    filename: function (req, file, cb) {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSufix + ".jpeg")
    }
})


const multerFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new FancyError("Unsupported file format", 400));
    }
};

export const productImgResize = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next();
    const files = req.files as Express.Multer.File[];

    await Promise.all(files.map(async (file: Request["file"]) => {
        await sharp(file?.path)
            .resize(300, 300)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`dist/public/images/products/${file?.filename}`)
        fs.unlinkSync(`dist/public/images/products/${file?.filename}`)
    }))
    next();
}
export const blogImgResize = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next();

    const files = req.files as Express.Multer.File[];

    await Promise.all(files.map(async (file: Request["file"]) => {
        await sharp(file?.path)
            .resize(300, 300)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`dist/public/images/blogs/${file?.filename}`)
        fs.unlinkSync(`dist/public/images/blogs/${file?.filename}`)
    }))
    next();
}

export const uploadPhoto = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fieldSize: 8 * 1000 * 1000 }
})