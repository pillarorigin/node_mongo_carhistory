const mongoose = require('mongoose');
const{Schema} = mongoose;

const userSchema = new Schema({
    userid : {
        type : String,
        required : true,
        unique : true
    },
    password : String,
    salt : String,
    name : String,
    email : String
 });
 
 module.exports = mongoose.model('User', userSchema);