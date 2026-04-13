const User = require("../models/User");

const getUserProfile = async (req, res) => {
    const {_id} = req.params; // Assuming auth middleware adds user info to req
    const user = await User.findById(_id); // Fetch user profile from database
    res.status(200).json({ message: "User profile retrieved successfully", data: user });
}   
module.exports = {
    getUserProfile
}