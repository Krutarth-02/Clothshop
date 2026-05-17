const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require("cookie-parser");
app.use(cookieParser());
require('dotenv').config();
// Connect to the database
connectDB();

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoute = require('./routes/auth.routes');
const productRoute = require('./routes/product.routes');
const userRoute = require('./routes/user.routes');

app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/user', userRoute);
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
