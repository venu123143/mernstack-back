var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
export const uploadImage = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const upload = yield cloudinary.uploader.upload(filePath);
    return { url: upload.secure_url, asset_id: upload.asset_id, public_id: upload.public_id };
});
export const deleteImage = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield cloudinary.uploader.destroy(filePath);
    return { url: deleted.secure_url, asset_id: deleted.asset_id, public_id: deleted.public_id };
});
