const mongoose=require('mongoose');
const { type } = require('os');
const signupschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});
const user=mongoose.model('userdetails',signupschema);
module.exports=user;