const mongoose = require("mongoose");
const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URL, { autoIndex: true });
    await Promise.all([require("../models/User").init(), require("../models/Payment").init()]);
    console.log("Connected to MongoDB");
};
module.exports = connectDB;
