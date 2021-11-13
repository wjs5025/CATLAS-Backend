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

  const userid = req.body.params.userid;
  const pwd2 = req.body.params.password;
  const sql = "SELECT * FROM users WHERE userid=?";
  const SHA2 = "SHA2('" + pwd2 + "', 256)";
  const pwdHasing = "SELECT " + SHA2 + ";";
  let pwd;
  con.query(pwdHasing, (err, results) => {
    const New = Object.values(JSON.parse(JSON.stringify(results[0])));
    pwd = New[0];
  });

  con.query(sql, [userid, pwd], (err, results) => {
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

  con.query(sql, (err, results) => {
    if (err) throw err;
    return res.send("Clear");
  });
});

app.get("/SignOut", (req, res) => {
  console.log("/SignOut _ GET");
  req.session.isLogined = false;
  req.session.destroy();
  res.redirect("/");
});

app.post("/SignOut", (req, res) => {
  console.log("/SignOut _ POST");
  req.session.isLogined = false;
  req.session.destroy(function () {
    req.session;
  });
  res.redirect("/");
});

//Use 쓰면 되냐 걍?
app.use("/ImageLinking", function (req, res) {
  console.log("ImageLinking");

  const path = req.query.Path;
  const filename = req.query.Filename;
  console.log(path, filename);

  res.sendFile(__dirname + path + filename);
});
//path.join(__dirname, "/assets/Catlas_Gallery/2021", "Corner1.png")

router.route("/Board").get(function (req, res) {
  const menu = req.query.BoardPath;

  console.log("Get " + menu + " Board");

  if (!isNaN(menu) || menu === "down") {
    // Gallery 일때
    console.log("Gallery");
    const sql =
      "SELECT * FROM gallery WHERE menu='" + menu + "' order by idx asc";

    con.query(sql, (err, results) => {
      const Tojson = JSON.parse(JSON.stringify(results));
      if (err) throw err;
      return res.send(Tojson);
    });
  } else {
    const sql =
      "SELECT menu,writer,date,views,idx,title FROM board WHERE menu='" +
      menu +
      "' order by idx asc";

    if (isNaN(menu)) {
      con.query(sql, (err, results) => {
        const Tojson = JSON.parse(JSON.stringify(results));

        Tojson.contents = undefined;
        if (err) throw err;
        return res.send(Tojson);
      });
    }
  }
});

router.route("/Detail").get(function (req, res) {
  const idx = req.query.PostNum;
  const menu = req.query.BoardPath;

  console.log("Get " + menu + "의 " + idx + "번글 호출");

  // 일반 게시판일때
  const sql =
    "SELECT * FROM board WHERE menu='" +
    menu +
    "' AND idx=" +
    idx +
    " order by idx asc";

  const ViewsPlussql =
    "UPDATE board SET views = views + 1 WHERE menu='" +
    menu +
    "' AND idx=" +
    idx +
    ";";

  con.query(ViewsPlussql, (err, results) => {});

  if (!isNaN(idx)) {
    // 숫자이여야지만 들어가게
    con.query(sql, (err, results) => {
      const Tojson = JSON.parse(JSON.stringify(results));
      if (err) throw err;
      return res.send(Tojson);
    });
  }
});

router.route("/Home").get(function (req, res) {
  console.log("Get Home");

  let ResJson = [];
  // 일반 게시판일때
  const Noticesql =
    "SELECT title,contents,idx,date FROM board WHERE menu='공지사항' order by idx desc LIMIT 2";

  const FreeForumsql =
    "SELECT title,contents,idx,date FROM board WHERE menu='자유게시판' order by idx desc LIMIT 1";

  const QuestionForumsql =
    "SELECT title,contents,idx,date FROM board WHERE menu='질문게시판' order by idx desc LIMIT 1";

  const AdvertisingForumsql =
    "SELECT title,contents,idx,date FROM board WHERE menu='홍보게시판' order by idx desc LIMIT 1";

  con.query(Noticesql, (err, results) => {
    const Tojson = JSON.parse(JSON.stringify(results));
    if (err) throw err;
    ResJson.push(Tojson);
  });

  con.query(FreeForumsql, (err, results) => {
    const Tojson = JSON.parse(JSON.stringify(results));
    if (err) throw err;
    ResJson.push(Tojson);
  });

  con.query(QuestionForumsql, (err, results) => {
    const Tojson = JSON.parse(JSON.stringify(results));
    if (err) throw err;
    ResJson.push(Tojson);
  });

  con.query(AdvertisingForumsql, (err, results) => {
    const Tojson = JSON.parse(JSON.stringify(results));
    if (err) throw err;
    ResJson.push(Tojson);
    return res.send(ResJson);
  });
});
