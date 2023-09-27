var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Worker } from "bullmq";
const sendEmail = () => new Promise((res, rej) => setTimeout(() => res('done'), 5 * 1000));
export const worker = () => new Worker('emailQueue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`Message recieved with id : ${job.id}`);
    console.log('Processing the message');
    console.log(`sending the email to ${(_a = job.data) === null || _a === void 0 ? void 0 : _a.email}`);
    yield sendEmail();
}));
worker();
