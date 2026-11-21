const mongoose = require("mongoose");
const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URL, { autoIndex: true });
    console.log("Connected to MongoDB");
};
module.exports = connectDB;
