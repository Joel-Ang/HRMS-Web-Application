const http = require('http');
const express = require("express");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require ("body-parser");
const app = express();
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

const db = mysql.createConnection ({
    host: "localhost",
    user: "root",
    password: "Password",
    database: "HRMS"
});

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
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));