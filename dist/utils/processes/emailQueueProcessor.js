const emailQueueProcessor = (job, done) => {
    console.log(job);
    done();
};
export default emailQueueProcessor;
