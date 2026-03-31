const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    email:{
        type:SVGStringList,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
    fullname:{
        type:String,
    },
    phone:{
        type:String,
    },
    address:{
        type:String,
    },
    city:{
        type:String,
    },
    country:{
        type:String,
    }
})
module.exports = mongoose.model("User",UserSchema)