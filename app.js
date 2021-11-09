// Initial Setting
const express = require("express");
const path = require("path");
const app = express();
const mysql = require("mysql");
const dbconfig = require("./config/database.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const router = express.Router();
const sessionStore = new MySQLStore(dbconfig);
const con = mysql.createConnection(dbconfig);
const port = process.env.PORT || 3001;
//app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "keboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      secure: false,
      maxAge: 600 * 1000,
    },
  })
);

// Router Setting
app.use("/", router);
module.exports = router;

router.use(function (req, res, next) {
  var today = new Date();
  let hour = today.getHours();
  let minute = today.getMinutes();
  let second = today.getSeconds();
  console.log("Time:", `${hour}:${minute}:${second}`);
  next();
});

app.listen(port, () => console.log("Example app listening on  " + port));

router.route("/").get(function (req, res) {
  console.log("get /");
  const sql = "SELECT * FROM users";
  con.query(sql, (err, results) => {
    if (err) throw err;
    return results.res;
  });
});

app.post("/", (req, res) => {
  console.log("post /");
});

router.route("/api/SignCheck").get(function (req, res) {
  console.log("isLogined =?  " + req.session.isLogined);
  if (req.session.isLogined == undefined) return res.send(false);
  else return res.send(true);
});

router.route("/api/WhoLogined").get(function (req, res) {
  console.log("WhoLogined =?  " + req.session.name);
  return res.send(req.session.name);
});

app.use("/SignIn", (req, res, next) => {
  console.log("SignIn Page");
  next();
});

//app.post("/SignIn", (req, res) => {
router.route("/SignIn").post(function (req, res) {
  console.log("Post SignIn");
  console.log(req.body.params);
  console.log(req.session);

  const name = req.body.params.name;
  const email = req.body.params.email;
  const sql = "SELECT * FROM users WHERE name=?";
  console.log(name + "\n");
  console.log(email + "\n");
  console.log(sql + "\n");

  con.query(sql, [name, email], (err, results) => {
    console.log("User info is: ", results);
    if (err) throw err;
    if (!results[0]) return res.send("please check your name");
    const user = results[0];
    if (user.email != email) return res.send("please check your email");
    else if (user.name == name && user.email == email) {
      console.log("Plz", name, email);
      req.session.id = user.id;
      req.session.name = user.name;
      req.session.isLogined = true;
      req.session.save(function () {
        return res.send("/");
        //return res.render("/Signout", { id: req.session.id });
        //return res.send("login success");
      });
    } else return res.send("error");
  });
});

app.get("/Signout", (req, res) => {
  req.session.isLogined = false;
  req.session.destroy();
  res.redirect("/");
});

app.post("/Signout", (req, res) => {
  console.log("LougTOUTOSUDFOUASDO");
  req.session.isLogined = false;
  req.session.destroy();
  res.redirect("/");
});
