// Initial Setting
const express = require("express");
var cors = require("cors");
const path = require("path");
const app = express();
const mysql = require("mysql2");
const dbconfig = require("./config/database.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const router = express.Router();
const sessionStore = new MySQLStore(dbconfig);
const con = mysql.createConnection(dbconfig);
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://172.18.3.24:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: "keboard cat",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,
      maxAge: 600 * 1000,
      httpOnly: false,
      //domain: "http://172.18.3.24:3000",
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Router Setting
module.exports = router;

app.use((req, res, next) => {
  const sql =
    "SELECT * FROM sessions WHERE session_id='" + req.session.Sid + "';";
  //console.log("SQL=", sql);
  con.query(sql, (err, results) => {
    //console.log("결과=", results);
    if (results[0] != undefined && results[0].session_id == req.query.Sid) {
      const DATA = JSON.parse(JSON.stringify(results[0].data));
      //console.log("로그인됐음", DATA);
      //console.log("Sid:", req.sessuion.Id);
      //res.send({ user_id: req.session.id });
    }
  });

  next();
});

app.use(function (req, res, next) {
  var today = new Date();
  let hour = today.getHours();
  let minute = today.getMinutes();
  let second = today.getSeconds();
  console.log("Time:", `${hour}:${minute}:${second}`);

  res.cookie("aaa", "bbb");
  req.session.ss = "123";

  // if (req.session.Sid) {
  //   console.log("session에 sid 있음!", req.session.Sid);
  //   //res.send(req.sessionID);
  // } else {
  //   console.log("session 없음");
  // }

  next();
});

app.use(express.static(path.join(__dirname, "./build")));

router.get("/", (req, res, next) => {
  console.log("Redirection");
  console.log(path.join(__dirname, "./build/index.html"));
  req.session.save(function () {
    res.send(express.static(path.join(__dirname, "./build/index.html")));
  });
});

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

//app.post("/SignIn", (req, res) => {
router.route("/SignIn").post(function (req, res) {
  console.log("Post SignIn");
  //console.log(req.body.params);
  // console.log(req.session);
  // console.log(req);
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
    if (!results[0]) return res.send("error");
    const user = results[0];
    if (user.password != pwd) return res.send("error");
    else if (user.userid == userid && user.password == pwd) {
      req.session.Id = user.userid;
      req.session.isLogined = true;
      // console.log("넘기는값", req.session);
      req.session.save(function () {
        return res.send(req.sessionID);
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

  con.query(sql, [name], (err, results) => {
    // console.log("User info is: ", results);
    if (err) throw err;
    return res.send("Clear");
  });
});

//Use 쓰면 되냐 걍?
app.use("/ImageLinking", function (req, res) {
  console.log("ImageLinking");
  const path = req.query.Path;
  const filename = req.query.Filename;
  //console.log(path, filename);
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
  const userid = req.query.user_id; // 추후 수정

  let ResJson = [];

  console.log("Get " + menu + "의 " + idx + "번글 호출");

  //뷰 증가
  const ViewsPlussql =
    "UPDATE board SET views = views + 1 WHERE menu='" +
    menu +
    "' AND idx=" +
    idx +
    ";";
  con.query(ViewsPlussql, (err, results) => {});

  // 일반 게시판일때
  const sql =
    "SELECT menu,writer,date,contents,views,idx,title,recommend FROM board WHERE menu='" +
    menu +
    "' AND idx=" +
    idx +
    " order by idx asc";

  // 글 담기.
  // 1. 글 정보
  if (!isNaN(idx)) {
    // 숫자이여야지만 들어가게

    con.query(sql, (err, results) => {
      const Tojson = JSON.parse(JSON.stringify(results));
      if (err) throw err;
      ResJson.push(Tojson);

      // 2. Forum- 댓글 정보

      const cmtSql =
        "SELECT contents,date,writer,idx FROM comment WHERE menu='" +
        menu +
        "' AND target=" +
        idx +
        " order by idx asc";
      con.query(cmtSql, (err, results) => {
        const Tojson = JSON.parse(JSON.stringify(results));
        if (err) throw err;
        ResJson.push(Tojson);
      });
    });

    // 3. 추천 정보
    //console.log("Session = ", req.session);

    const IDsql = "SELECT id FROM users WHERE userid='" + userid + "';";

    con.query(IDsql, (err, results) => {
      const Tojson = JSON.parse(JSON.stringify(results));
      Query_id = Tojson[0].id;

      const sql =
        "SELECT recommend, recommend_users FROM board WHERE menu='" +
        menu +
        "' AND idx=" +
        idx +
        " order by idx asc";

      con.query(sql, [idx, menu, userid], (err, results) => {
        const Tojson = JSON.parse(JSON.stringify(results));
        Recommend_count = Tojson[0].recommend;
        Recommend_users = Tojson[0].recommend_users;

        const Userfindsql =
          "SELECT recommend_users FROM board WHERE menu='" +
          menu +
          "' AND idx=" +
          idx;

        let TempString = "/";
        let Userupdatesql = "";
        con.query(Userfindsql, (err, results) => {
          const Tojson = JSON.parse(JSON.stringify(results));
          TempString = Tojson[0].recommend_users;
          if (TempString.indexOf("/" + Query_id + "/") != -1) {
            ResJson.push({ state: true, Recommend_count: Recommend_count });
          } else {
            ResJson.push({ state: false, Recommend_count: Recommend_count });
          }
          return res.send(ResJson);
        });
      });
    });
  }
});

//  댓글 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

router.route("/Comment").get(function (req, res) {
  const idx = req.query.PostNum;
  const menu = req.query.BoardPath;
  const userid = req.query.userid;
  const contents = req.query.contents;
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }

  today = yyyy + "-" + mm + "-" + dd;
  console.log("날짜= ", today);
  const Indexsql =
    "SELECT idx FROM comment WHERE menu='" +
    menu +
    "' AND target=" +
    idx +
    " order by idx desc LIMIT 1";

  console.log(Indexsql);
  con.query(Indexsql, (err, results) => {
    const Tojson = JSON.parse(JSON.stringify(results));
    console.log(Tojson);
    const index = Tojson[0].idx + 1;

    console.log(
      "Get " +
        menu +
        "의 " +
        idx +
        "번글 " +
        index +
        "번째 Comment를 " +
        userid +
        "가 작성"
    );

    const sql =
      "INSERT INTO comment ( contents, date, menu, writer, idx, target) VALUES ( '" +
      contents +
      "' , '" +
      today +
      "', '" +
      menu +
      "', '" +
      userid +
      "', '" +
      index +
      "', '" +
      idx +
      "');";
    con.query(sql, (err, results) => {
      // const cmtSql =
      //   "SELECT contents,date,writer,idx FROM comment WHERE menu='" +
      //   menu +
      //   "' AND target=" +
      //   idx +
      //   " order by idx asc";
      // con.query(cmtSql, (err, results) => {
      //   const Tojson = JSON.parse(JSON.stringify(results));
      //   if (err) throw err;
      //   return res.send(Tojson);
      // });
    });
  });
  return res.send("/");
});

router.route("/Recommend").get(function (req, res) {
  const idx = req.query.PostNum;
  const menu = req.query.BoardPath;
  const userid = req.query.user_id; // 추후 수정
  const state = req.query.state;
  let Query_id = 0;
  let Recommend_count = 0;
  let Recommend_users = "";
  const IDsql = "SELECT id FROM users WHERE userid='" + userid + "';";

  // 유저 이름으로 쿼리 id 값 찾기
  if (!isNaN(idx)) {
    // 숫자이여야지만 들어가게

    con.query(IDsql, (err, results) => {
      const Tojson = JSON.parse(JSON.stringify(results));
      Query_id = Tojson[0].id;

      console.log("Get " + menu + "의 " + idx + "번글 " + userid + "님이 추천");

      // 일반 게시판일때
      const sql =
        "SELECT recommend, recommend_users FROM board WHERE menu='" +
        menu +
        "' AND idx=" +
        idx +
        " order by idx asc";

      con.query(sql, [idx, menu, userid, state], (err, results) => {
        const Tojson = JSON.parse(JSON.stringify(results));
        Recommend_count = Tojson[0].recommend;
        Recommend_users = Tojson[0].recommend_users;

        // 눌 -> 값 -1 , 배열에서 지우기     /1/2/3/4 =>  /id/ 찾아서 id/ 지우고 다시 붙이기
        if (state == "true") {
          const RecommendUpdatesql =
            "UPDATE board SET recommend= recommend - 1 WHERE menu='" +
            menu +
            "' AND idx=" +
            idx +
            ";";
          con.query(RecommendUpdatesql, (err, results) => {});

          const Userfindsql =
            "SELECT recommend_users FROM board WHERE menu='" +
            menu +
            "' AND idx=" +
            idx;

          let TempString = "/";
          let Userupdatesql = "";
          con.query(Userfindsql, (err, results) => {
            const Tojson = JSON.parse(JSON.stringify(results));
            TempString = Tojson[0].recommend_users;
            TempString = TempString.replace("/" + Query_id + "/", "/");
            Userupdatesql =
              "UPDATE board SET recommend_users='" +
              TempString +
              "' WHERE menu='" +
              menu +
              "' AND idx=" +
              idx;
            con.query(Userupdatesql, (err, results) => {});
            return res.send({
              state: false,
              Recommend_count: Recommend_count - 1,
            });
          });
        }

        // 안눌 -> 값 +1 , 배열에 추가      마지막에  id/ 추가
        else {
          const RecommendUpdatesql =
            "UPDATE board SET recommend= recommend + 1 WHERE menu='" +
            menu +
            "' AND idx=" +
            idx +
            ";";
          con.query(RecommendUpdatesql, (err, results) => {});

          const Userfindsql =
            "SELECT recommend_users FROM board WHERE menu='" +
            menu +
            "' AND idx=" +
            idx;

          let TempString = "/";
          let Userupdatesql = "";
          con.query(Userfindsql, (err, results) => {
            const Tojson = JSON.parse(JSON.stringify(results));
            TempString = Tojson[0].recommend_users;
            TempString = TempString.concat(Query_id + "/");
            Userupdatesql =
              "UPDATE board SET recommend_users='" +
              TempString +
              "' WHERE menu='" +
              menu +
              "' AND idx=" +
              idx;
            con.query(Userupdatesql, (err, results) => {});
            return res.send({
              state: true,
              Recommend_count: Recommend_count + 1,
            });
          });
        }
      });
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

router.route("/Test").get(function (req, res) {
  // 크롤링을 위한 import (axios, cheerio)
  const axios = require("axios");
  const cheerio = require("cheerio");

  let currentPage = 1;
  let url_notice =
    "https://newgh.gnu.ac.kr/cs/na/ntt/selectNttList.do?mi=6694&bbsId=2351&currPage=";

  let url_noticeSW =
    "https://newgh.gnu.ac.kr/cs/na/ntt/selectNttList.do?mi=6695&bbsId=2352&currPage=";

  // 게시판 - 공지사항
  const getCurrURL_notice = (url) => {
    url = url + currentPage.toString();
    return url;
  };

  // 게시판 - 공지사항(SW)
  const getCurrURL_noticeSW = (url) => {
    url =
      "https://newgh.gnu.ac.kr/cs/na/ntt/selectNttList.do?mi=6695&bbsId=2352&currPage=" +
      currentPage.toString();
    return url;
  };

  //axios를 이용한 통신
  const getHTML = async (url) => {
    try {
      return await axios.get(getCurrURL_notice(url));
    } catch (error) {
      console.error(error);
    }
  };

  getHTML(url_notice)
    .then((html) => {
      let postList = [];
      const $ = cheerio.load(html.data);
      const $bodyList = $("div.BD_list table tbody").children("tr");
      $bodyList.each(function (i, elem) {
        postList[i] = {
          title: $(this).find("td.ta_l a").text().trim(),
          writer: $(this).find("td:nth-of-type(3)").text().trim(),
          date: $(this).find("td:nth-of-type(4)").text().trim(),
        };
      });
      return postList;
    })
    .then((res) => console.log("결과", res));

  getHTML(url_noticeSW)
    .then((html) => {
      let postList = [];
      const $ = cheerio.load(html.data);
      const $bodyList = $("div.BD_list table tbody").children("tr");
      $bodyList.each(function (i, elem) {
        postList[i] = {
          title: "[SW] " + $(this).find("td.ta_l a").text().trim(),
          writer: $(this).find("td:nth-of-type(3)").text().trim(),
          date: $(this).find("td:nth-of-type(4)").text().trim(),
        };
      });
      return postList;
    })
    .then((res) => console.log("결과", res));
});

app.use("/", router);
app.all("*", function (req, res) {
  res.status(404).send("<h1> 요청 페이지 없음 </h1>");
});
app.listen(port, () => console.log("Example app listening on  " + port));
