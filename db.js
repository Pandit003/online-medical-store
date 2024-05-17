const mongoose=require('mongoose');
require('dotenv').config();
// const signupURL='mongodb://localhost:27017/userdetail'
// const medicalURL='mongodb://localhost:27017/medicalshop'
// const medicineURL='mongodb://localhost:27017/medicines'

// const mongoURL='mongodb://localhost:27017/school'
// const mongoURL=process.env.MONGODB_URL_LOCAL;
const mongoURL=process.env.MONGODB_URL;
mongoose.connect(mongoURL,{
    // useNewUrlParser:true,
    // useUnifiedTopology:true
})
const db=mongoose.connection;

db.on('connected',()=>{
    console.log('connected to mongoDB server');
});
db.on('error',(err)=>{
    console.log('mongoDB connection error : ',err);
});
db.on('disconnected',()=>{
    console.log('mongoDB disconnected');
});
 
module.exports=db;