import { Worker } from "bullmq"

const sendEmail = () => new Promise((res, rej) => setTimeout(() => res('done'), 5 * 1000))
export const worker = () => new Worker('emailQueue', async (job) => {
    console.log(`Message recieved with id : ${job.id}`);
    console.log('Processing the message');
    console.log(`sending the email to ${job.data?.email}`);
    await sendEmail()
})
worker()



