const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require("cookie-parser");
app.use(cookieParser());
require('dotenv').config();
console.log("MONGO_URI:", process.env.MONGO_URI);

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoute = require('./routes/auth.route');
app.use('/api/auth', authRoute);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
