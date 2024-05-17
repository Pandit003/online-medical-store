const express = require('express');
const ejs = require("ejs");
const session = require('express-session');
const db = require('./db');
const bodyParser = require('body-parser');
const school = require('./models/school');
const medicineSchema = require('./models/medicine');
const imgSchema = require('./models/image');
const userdetail = require('./models/signup');
const https = require("https");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');


require('dotenv').config();

const app = express();

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });
 
app.get('/image', (req, res) => {
    imgSchema.find({})
    .then((data, err)=>{
        if(err){
            console.log(err);
        }
        res.render('imagepage',{items: data})
    })
});
 

app.post("/medicine", async (req, res) => {
    try {
        const data = req.body;
        const medicine = new medicineSchema(data);
        const response = await medicine.save();
        console.log('medicine added');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});
 
app.post('/image', upload.single('image'), (req, res, next) => {
 
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgSchema.create(obj)
    .then((item, err) => {
        res.redirect('/image');
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error saving image');
    });
});

app.get("/", (req, res) => {
    const user = req.session.user;
    var display_profile="",display_img="";
    if(user){
     display_profile="";
     display_img="d-none";
    res.render("index",{ display_profile: display_profile,display_img:display_img});
    }else{
        display_profile="d-none";
        display_img="";
        res.render("index",{ display_profile: display_profile,display_img:display_img});
    }
});



app.get("/signin", (req, res) => {
    res.render("signin");
});

app.get("/signup", (req, res) => {
    res.render("register");
});

app.post("/signup", async (req, res) => {
    try {
        const signupdata = req.body;
        const newssignup = new userdetail(signupdata);
        const signupresponse = await newssignup.save();
        console.log('data saved');
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.post("/signin", async (req, res) => {
    try {
        var userdata = req.body;
        var email = userdata.email;
        var pwd = userdata.password;

        const user = await userdetail.findOne({ "email": email });

        if (user) {
            // console.log("User found in database:", user);
            if (user.password === pwd) {
                var name = user.name;
                console.log("Password matched");
                req.session.user = user; // Storing user data in session
                // res.render("index", { username: name });
                res.redirect("/");
            } else {
                console.log("Password not matched");
                res.status(401).json({ error: "Invalid password" });
            }
        } else {
            console.log("User not found");
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/signin');
    }
};

app.get("/myinfo", isAuthenticated, (req, res) => {
    const user = req.session.user;
    res.render("myinfo", { user });
    // console.log(user);
});
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: 'Error logging out' });
        } else {
            res.redirect('/signin');
        }
    });
});


app.get("/student", async function (req, res) {
    try {
        // const user = req.session.user;
        // console.log(user);
        // console.log(user.name);
        const data = await school.find();
        console.log('data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.post("/student", async (req, res) => {
    try {
        const data = req.body;
        const newschool = new school(data);
        const response = await newschool.save();
        console.log('data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});
const axios = require('axios');
app.get("/info", async function (req, res) {
    const options = {
        method: 'GET',
        url: 'https://drug-info-and-price-history.p.rapidapi.com/1/druginfo',
        params: {drug: 'advil'},
        headers: {
          'X-RapidAPI-Key': '297de513f2msh808eaf7f049dd12p1f538fjsn2c593c45f76b',
          'X-RapidAPI-Host': 'drug-info-and-price-history.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
          console.log(response.data);
          res.send(response.data);
      } catch (error) {
          console.error(error);
      }
});
app.get("/product_list", (req, res) => {
    res.render("product_list");
});
app.get("/categories", (req, res) => {
    res.render("categories");
});
app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});
app.get("/add_medicine", (req, res) => {
    res.render("addmedicine");
});
app.listen(3000, () => {
    console.log('server started at port no 3000');
});
