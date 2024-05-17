const mongoose=require('mongoose');
const { type } = require('os');
const schoolschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number
    },
    work:{
        type:String,
        enum:['teacher','student','worker'],
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    address:{
        type:String
    },
    salary:{
        type:Number
    }
});
const school=mongoose.model('school',schoolschema);
module.exports=school;