
const emailQueueProcessor = (job: any, done: any) => {
    console.log(job)
    done()

}
export default emailQueueProcessor