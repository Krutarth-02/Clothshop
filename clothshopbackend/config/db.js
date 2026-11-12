const mongoose = require("mongoose");
const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    // Checkout requires the uniqueness indexes before requests are accepted.
    await require("../models/User").init();
    await require("../models/Payment").init();
    await require("../models/AdminActivity").init();
    console.log("Connected to MongoDB");
};
module.exports = connectDB;
