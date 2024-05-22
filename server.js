const express = require('express');
const ejs = require("ejs");
const session = require('express-session');
const db = require('./db');
const bodyParser = require('body-parser');
const school = require('./models/school');
const medicineSchema = require('./models/pharmacy');
const imgSchema = require('./models/image');
const userdetail = require('./models/signup');
const countries = require('./models/country');
const https = require("https");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


const PORT=process.env.PORT || 3000;
var multer = require('multer');

const API_KEY='e5239ed81bb94f00bbab906d1996840f';
app.get('/api/news', async (req, res) => {
    const today = new Date();
    const dd = String(today.getDate() - 2).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = String(today.getFullYear());
    const date = `${yyyy}-${mm}-${dd}`;
    const apiUrl = `https://newsapi.org/v2/everything?q=medicine&from=${date}&sortBy=popularity&apiKey=${API_KEY}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });
 
app.get('/image', async (req, res) => {
    try {
        const images = await imgSchema.find({});
        res.render('imagepage', { images: images });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving images');
    }
});


app.post("/pharmacy", async (req, res) => {
    try {
        const data = req.body;
        const pharmacy = new medicineSchema(data);
        const response = await pharmacy.save();
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
    let display_profile = "";
    let display_img = "";
    let username = "";

    if (user) {
        username = user.name;
        display_profile = "";
        display_img = "d-none";
    } else {
        display_profile = "d-none";
        display_img = "";
    }

    res.render("index", {
        display_profile: display_profile,
        display_img: display_img,
        username: username // Always pass username
    });
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
            if (user.password === pwd) {
                var name = user.name;
                console.log("Password matched");
                req.session.user = user; 
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

app.get("/countries", async function (req, res) {
    try {
        const data = await countries.find();
        console.log('data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.post("/countries", async (req, res) => {
    try {
        const data = req.body;
        const country = new countries(data);
        const response = await country.save();
        console.log('data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.listen(PORT, () => {
    console.log('server started at port no 3000');
});
