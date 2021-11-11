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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// let corsOptions = {
//   origin: 'https://www.gnu.catlas.ac.kr',
//   credentials: true
// }
//  카틀라스에서 요청한 것만 허락하기 COR 관련

var cors = require("cors");
app.use(cors());

// app.use(cors(corsOptions));

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

// router.route("/").get(function (req, res) {
//   console.log("get /");
//   const sql = "SELECT * FROM users";
//   con.query(sql, (err, results) => {
//     if (err) throw err;
//     return results.res;
//   });
// });

// app.post("/", (req, res) => {
//   console.log("post /");
// });

// router.route("/SignCheck").get(function (req, res) {
//   console.log("isLogined =?  " + req.session.isLogined);
//   if (req.session.isLogined == undefined) return res.send(false);
//   else return res.send(true);
// });

// router.route("/WhoLogined").get(function (req, res) {
//   console.log("WhoLogined =?  " + req.session.name);
//   return res.send(req.session.name);
// });

app.use("/SignIn", (req, res, next) => {
  console.log("SignIn Page");
  next();
});

app.post("/SignIn", (req, res) => {
  console.log("/SignIn _ POST");
});

//app.post("/SignIn", (req, res) => {
router.route("/SignIn").post(function (req, res) {
  console.log("Post SignIn");

  console.log(req.body.params);
  // console.log(req.session);

  const userid = req.body.params.userid;
  const pwd2 = req.body.params.password;
  const sql = "SELECT * FROM users WHERE name=?";
  const SHA2 = "SHA2('" + pwd2 + "', 256)";
  const pwdHasing = "SELECT " + SHA2 + ";";
  let pwd;
  con.query(pwdHasing, (err, results) => {
    const New = Object.values(JSON.parse(JSON.stringify(results[0])));
    console.log(New[0]);
    pwd = New[0];
  });

  con.query(sql, [userid, pwd], (err, results) => {
    console.log("User info is: ", results);
    console.log("pwd info is: ", pwd);
    if (err) throw err;
    if (!results[0]) return res.send("please check your ID");
    const user = results[0];
    if (user.password != pwd) return res.send("please check your pwd");
    else if (user.userid == userid && user.password == pwd) {
      req.session.id = user.userid;
      req.session.isLogined = true;
      req.session.save(function () {
        return res.send("/");
        //return res.render("/Signout", { id: req.session.id });
        //return res.send("login success");
      });
    } else return res.send("error");
  });
});

router.route("/SignUp").post(function (req, res) {
  console.log("Post SignUp");
  console.log(req.body.params);
  console.log(req.body.params.userid);
  console.log(req.body.params.password);
  console.log(req.body.params.name);
  console.log(req.body.params.email);
  console.log(req.body.params.phonenumber);
  console.log(req.session);

  const userid = req.body.params.userid;
  const password = req.body.params.password;
  const name = req.body.params.name;
  const email = req.body.params.email;
  const phonenumber = req.body.params.phonenumber;
  const sql =
    "INSERT INTO users ( userid, password, name, email, phonenumber) VALUES ( '" +
    userid +
    "' , SHA2('" +
    password +
    "',256), '" +
    name +
    "', '" +
    email +
    "', '" +
    phonenumber +
    "');";

  con.query(sql, [name], (err, results) => {
    console.log("User info is: ", results);
    if (err) throw err;
    return res.send("Clear");
  });
});

app.get("/Signout", (req, res) => {
  console.log("/Signout _ GET");
  req.session.isLogined = false;
  req.session.destroy();
  res.redirect("/");
});

app.post("/Signout", (req, res) => {
  console.log("/Signout _ POST");
  req.session.isLogined = false;
  req.session.destroy();
  res.redirect("/");
});
