const http = require('http');
const express = require("express"); // have
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require ("body-parser");
const app = express();  // have
const mysql = require("mysql");

app.use(bodyParser.urlencoded({ extended: true }));

const port = 8089;

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

// cookie parser
app.use(cookieParser());

// create connection to database hosted on 
// Public IP: 34.87.32.129 
const db = mysql.createConnection ({
    host: "34.87.32.129",
    user: "root",
    password: "RYsCu397",
    database: "HRMS"
});

// const db = mysql.createConnection ({
//     host: "localhost",
//     user: "root",
//     password: "password",
//     database: "myAgileProject"
// });

 // connect to database
 db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("Connected to database");
 });
 global.db = db;

require("./routes/main")(app);
app.set("views",__dirname + "/views");


// below codes taken from jesse's mid term assignment for database

// make images from local computer public so that markers can see the images 
const path = require ('path');
app.set("views", path.resolve(__dirname, "views/ejs"));
app.use(express.static(path.join(__dirname, 'public')))
app.engine("html", require("ejs").renderFile);
app.listen(port,() => console.log (`App listening on port http://localhost:${port}`));


app.set("views", __dirname + "/views");
app.set ("view engine", "ejs");
app.use('/static', express.static(path.join(__dirname, 'public')))




