const mongoose=require('mongoose');
const mongoURL='mongodb://localhost:27017/school'
const signupURL='mongodb://localhost:27017/userdetail'
const medicalURL='mongodb://localhost:27017/medicalshop'
const medicineURL='mongodb://localhost:27017/medicines'

mongoose.connect(medicalURL,{
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