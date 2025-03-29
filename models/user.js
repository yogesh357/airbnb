const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//This is used in authontication when we are using mongoDB database
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    },


});
//BY using this mongoose automatically create salt value (salting), hash value(hashing) & username
userSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model("User" ,userSchema)