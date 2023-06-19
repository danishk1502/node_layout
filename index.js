const express = require('express');
const app = express();
const port = 5001;
const mongoose = require("mongoose");
const Joi = require('joi');
const joig = require('joigoose')(mongoose);
// const expressLayout = require('express-ejs-layouts');

const model = mongoose.connect("mongodb://127.0.0.1:27017/crudb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
).then(() => {
    console.log("mongodb connected");
}).catch(() => {
    console.log("error occured mongodb");
});

const dataTable = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))

    
});

const authInfo = new mongoose.Schema(
    joig.convert(dataTable)
);
const database = mongoose.model("userAuthentication", authInfo);

// app.use(express.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// app.use(bodyParser.urlencoded({extended:true}));
// app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/Templates/index.html")
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/Templates/login.html")
});


//##############################################(______User Creation______)########################################################################

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/public/Templates/signup.html")
});

app.post("/signup", async(req, res) => {
    try{
    const results = await database.find({});
    const uname = req.body.username;
    const email =  req.body.email;
    let value =null;
    for(let i=0; i<results.length; i++){
        if(results[i].username==uname || results[i].email==email){

            value=results[i];
        }
    }
    // console.log(results);
    if(value==null){
        const Data = new database({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
    
        });
        Data.save();
        res.redirect("/login");
    }
    else{
        console.log("uname already exists")
    }
   
}
catch (err){
    throw err;
}
});

app.post("/login", async (req, res) => {
    const userName = req.body.userName;
    const passw = req.body.Password;
    // console.log(userName);
    try {
        const results = await database.find({});
        console.log(results);
        for (let i = 0; i < results.length; i++) {
            if (results[i].username === userName) {
                if (results[i].password === passw) {
                    console.log("password check");
                    res.redirect("/");
                    break;
                }
                else {
                    res.send(`<script>alert("your alert message"); window.location.href = "/login";</script>`);
                    break;
                }
            }
            console.log("i am here");

        }

    }
    catch (err) {
        throw err;
    }
});
app.listen(port, () => {
    console.log("app listen at port :" + port);
});