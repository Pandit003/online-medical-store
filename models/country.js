const mongoose=require('mongoose');
const { type } = require('os');
const countryschema=new mongoose.Schema({
    country:{
        type:String,
    },
    sl_no:{
        type:Number
    }
});
const country=mongoose.model('country',countryschema);
module.exports=country;