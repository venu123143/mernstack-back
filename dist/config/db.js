import mongoose from "mongoose";
const db = process.env.DATABASE;
if (db !== undefined) {
    mongoose.connect(db)
        .then(() => console.log('connection sucessful'))
        .catch((err) => console.log(err, "conn failed"));
}
