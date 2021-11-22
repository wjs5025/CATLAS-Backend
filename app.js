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

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ Cors 설정
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
//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router Setting
module.exports = router;

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 세션 확인용 / 미완성

app.use((req, res, next) => {
  // console.log("SID = ", req.session.Id);
  // console.log("isLogined = ", req.session.isLogined);
  if (req.session.isLogined != undefined) {
    const sql =
      "SELECT * FROM sessions WHERE session_id='" + req.sessionID + "';";

    con.query(sql, (err, results) => {
      try {
        let Tojson = results[0].data;
        const ID = Tojson.slice(Tojson.indexOf(`"Id":"`) + 6, -2);

        if (results[0] != undefined && req.session.Id === ID) {
          //res.send({ access: true });
          //req.session.isLogined=true;
          //next();
        } else {
          //res.send({ access: false });
          //req.session.isLogined=false;
          //next();
        }
      } catch (exception) {
        return res.send("error");
      }
    });
  }

  next();
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 처음 시작할 때, 로그 확인용

app.use(function (req, res, next) {
  var today = new Date();
  let hour = today.getHours();
  let minute = today.getMinutes();
  let second = today.getSeconds();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  today = yyyy + "-" + mm + "-" + dd;
  console.log("Time:", `${yyyy}-${mm}-${dd} ${hour}:${minute}:${second}`);

  // if (req.session.Sid) {
  //   console.log("session에 sid 있음!", req.session.Sid);
  //   //res.send(req.sessionID);
  // } else {
  //   console.log("session 없음");
  // }
  next();
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 빌드 한 것 메인페이지 리다이렉션

app.use(express.static(path.join(__dirname, "./build")));
app.use(express.static(path.join(__dirname, "./assets")));

router.get("/", (req, res, next) => {
  console.log("Redirection");
  console.log(path.join(__dirname, "./build/index.html"));
  req.session.save(function () {
    res.send(express.static(path.join(__dirname, "./build/index.html")));
  });
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 로그인

console.log("Post SignIn");
router.route("/SignIn").post(function (req, res) {
  const userid = req.body.params.userid;
  const pwd2 = req.body.params.password;
  const sql = "SELECT * FROM users WHERE userid=?";
  const SHA2 = "SHA2('" + pwd2 + "', 256)";
  const pwdHasing = "SELECT " + SHA2 + ";";
  let pwd;

  con.query(pwdHasing, (err, results) => {
    try {
      const New = Object.values(JSON.parse(JSON.stringify(results[0])));
      pwd = New[0];
    } catch (exception) {
      return res.send("error");
    }
    con.query(sql, [userid, pwd], (err, results) => {
      try {
        if (!results[0]) return res.send("error");

        const user = results[0];
        if (user.password != pwd) return res.send("error");
        else if (user.userid == userid && user.password == pwd) {
          req.session.isLogined = true;
          req.session.Id = user.userid;

          req.session.save(function () {
            return res.send(req.sessionID);
          });
        } else return res.send("error");
      } catch (exception) {
        return res.send("error");
      }
    });
  });
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 회원가입  중복 아이디 검사!

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
    try {
      return res.send("Clear");
    } catch (exception) {
      return res.send("error");
    }
  });
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 이미지 보내주기
app.use("/ImageLinking", function (req, res) {
  console.log("ImageLinking");
  const path = req.query.path;
  const filename = req.query.filename;
  res.sendFile(__dirname + path + filename);
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시글 목록

router.route("/Board").get(function (req, res) {
  const menu = req.query.BoardPath;
  let sql;
  console.log("Get " + menu + " Board");

  if (menu === "down" || !isNaN(menu)) {
    // 갤러리
    sql =
      "SELECT menu,writer,date,views,idx,title,path,filename,comment_count FROM board WHERE menu='" +
      menu +
      "' order by idx desc";
  } else if (menu === "HOT게시판") {
    // HOT게시판
    sql =
      "SELECT menu,writer,date,views,idx,title,recommend,comment_count FROM board WHERE menu IN('자유게시판','질문게시판','홍보게시판','동아리게시판','IT게시판') order by recommend desc LIMIT 10;";
    menu + "' order by idx asc";
  } else {
    sql =
      "SELECT menu,writer,date,views,idx,title,recommend,comment_count FROM board WHERE menu='" +
      menu +
      "' order by idx desc";
  }
  con.query(sql, (err, results) => {
    try {
      const Tojson = JSON.parse(JSON.stringify(results));
      //console.log(Tojson);
      return res.send(Tojson);
    } catch (exception) {
      return res.send("error");
    }
  });
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시글 세부사항

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
  con.query(ViewsPlussql, (err, results) => {
    try {
    } catch (exception) {
      return res.send("error");
    }
  });

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
      try {
        const Tojson = JSON.parse(JSON.stringify(results));
        if (err) throw err;
        ResJson.push(Tojson);

        // 2. Forum- 댓글 정보
      } catch (exception) {
        return res.send("error");
      }
      const cmtSql =
        "SELECT contents,date,writer,idx FROM comment WHERE menu='" +
        menu +
        "' AND target=" +
        idx +
        " order by idx asc";

      con.query(cmtSql, (err, results) => {
        try {
          const Tojson = JSON.parse(JSON.stringify(results));
          if (err) throw err;
          ResJson.push(Tojson);
        } catch (exception) {
          return res.send("error");
        }
      });
    });

    // 3. 추천 정보
    //console.log("Session = ", req.session);

    const IDsql = "SELECT id FROM users WHERE userid='" + userid + "';";

    con.query(IDsql, (err, results) => {
      const Tojson = JSON.parse(JSON.stringify(results));
      try {
        Query_id = Tojson[0].id;

        const sql =
          "SELECT recommend, recommend_users FROM board WHERE menu='" +
          menu +
          "' AND idx=" +
          idx +
          " order by idx asc";
      } catch (exception) {
        return res.send("error");
      }

      con.query(sql, [idx, menu, userid], (err, results) => {
        try {
          const Tojson = JSON.parse(JSON.stringify(results));
          Recommend_count = Tojson[0].recommend;
          Recommend_users = Tojson[0].recommend_users;
        } catch (exception) {
          return res.send("error");
        }
        const Userfindsql =
          "SELECT recommend_users FROM board WHERE menu='" +
          menu +
          "' AND idx=" +
          idx;

        let TempString = "/";
        let Userupdatesql = "";

        con.query(Userfindsql, (err, results) => {
          try {
            const Tojson = JSON.parse(JSON.stringify(results));
            TempString = Tojson[0].recommend_users;
            if (TempString.indexOf("/" + Query_id + "/") != -1) {
              ResJson.push({ state: true, Recommend_count: Recommend_count });
            } else {
              ResJson.push({ state: false, Recommend_count: Recommend_count });
            }
          } catch (exception) {
            return res.send("error");
          }
          if (menu === "down" || !isNaN(menu)) {
            // 갤러리
            const Imagesql =
              "SELECT idx,path,filename FROM gallery WHERE menu='" +
              menu +
              "' AND target=" +
              idx;

            con.query(Imagesql, (err, results) => {
              try {
                const Tojson = JSON.parse(JSON.stringify(results));
                ResJson.push(Tojson);
                return res.send(ResJson);
              } catch (exception) {
                return res.send("error");
              }
            });
          } else {
            return res.send(ResJson);
          }
        });
      });
    });
  } else return res.send("error1");
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 댓글  작성

router.route("/Comment").get(function (req, res) {
  const idx = req.query.PostNum;
  const menu = req.query.BoardPath;
  const userid = req.query.userid;
  const contents = req.query.contents;

  const curr = new Date();
  const utc = curr.getTime() + 9 * 60 * 60 * 1000;
  let today = new Date(utc);
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();
  let hour = today.getHours();
  let minute = today.getMinutes();
  let second = today.getSeconds();

  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }

  today = yyyy + "-" + mm + "-" + dd + " " + hour + ":" + minute + ":" + second;
  const Indexsql =
    "SELECT idx FROM comment WHERE menu='" +
    menu +
    "' AND target=" +
    idx +
    " order by idx desc LIMIT 1";

  con.query(Indexsql, (err, results) => {
    const Tojson = JSON.parse(JSON.stringify(results));
    let index = 0;
    if (!Tojson[0]) {
      index = 1;
    } else {
      index = Tojson[0].idx + 1;
    }

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
    //console.log(sql);
    con.query(sql, (err, results) => {
      try {
        const CommentPlussql =
          "UPDATE board SET comment_count = comment_count + 1 WHERE menu='" +
          menu +
          "' AND idx=" +
          idx +
          ";";
        con.query(CommentPlussql, (err, results) => {});
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
      } catch (exception) {
        return res.send("error");
      }
    });
  });
  return res.send("/");
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 댓글  삭제

router.route("/Comment_Delete").get(function (req, res) {
  const idx = req.query.PostNum;
  const menu = req.query.BoardPath;
  const userid = req.query.userid;
  const commentidx = req.query.idx;
  const sql =
    "SELECT writer FROM comment WHERE menu='" +
    menu +
    "' AND target=" +
    idx +
    " AND idx=" +
    commentidx +
    ";";

  con.query(sql, (err, results) => {
    try {
      const Tojson = JSON.parse(JSON.stringify(results));
      if (Tojson[0].writer === userid) {
        const Delsql =
          "DELETE FROM comment WHERE menu='" +
          menu +
          "' AND target=" +
          idx +
          " AND idx=" +
          commentidx +
          ";";
        con.query(Delsql, (err, results) => {
          try {
            const CommentMinussql =
              "UPDATE board SET comment_count = comment_count - 1 WHERE menu='" +
              menu +
              "' AND idx=" +
              idx +
              ";";
            con.query(CommentMinussql, (err, results) => {});
            return res.send("/");
          } catch (exception) {
            return res.send("error");
          }
        });
      } else return res.send("error");
    } catch (exception) {
      return res.send("error");
    }
  });
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시글 작성

router.route("/Posting").get(function (req, res) {
  const menu = req.query.BoardPath;
  const userid = req.query.userid;
  const contents = req.query.contents;
  const title = req.query.title;
  const curr = new Date();
  const utc = curr.getTime() + 9 * 60 * 60 * 1000;
  let today = new Date(utc);
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();
  let hour = today.getHours();
  let minute = today.getMinutes();
  let second = today.getSeconds();

  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }

  today = yyyy + "-" + mm + "-" + dd + " " + hour + ":" + minute + ":" + second;

  const Indexsql =
    "SELECT idx FROM board WHERE menu='" + menu + "'order by idx desc LIMIT 1";

  con.query(Indexsql, (err, results) => {
    try {
      const Tojson = JSON.parse(JSON.stringify(results));
      const index = Tojson[0].idx + 1;

      console.log(
        "Get " + menu + "의 " + index + "번째 글을 " + userid + "가 작성"
      );

      const sql =
        "INSERT INTO board ( contents, date, menu, writer, idx, views, recommend, title, recommend_users) VALUES ( '" +
        contents +
        "' , '" +
        today +
        "', '" +
        menu +
        "', '" +
        userid +
        "', '" +
        index +
        "', 0 , 0,'" +
        title +
        "', '/');";

      con.query(sql, (err, results) => {
        try {
        } catch (exception) {
          return res.send("error");
        }
      });
    } catch (exception) {
      return res.send("error");
    }
  });
  return res.send("/");
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시글 수정
router.route("/Post_Modify").get(function (req, res) {
  const idx = req.query.PostNum;
  const menu = req.query.BoardPath;
  const userid = req.query.userid;
  const contents = req.query.contents;
  const title = req.query.title;
  const sql =
    "SELECT writer FROM board WHERE menu='" + menu + "' AND idx=" + idx + ";";

  con.query(sql, (err, results) => {
    try {
      const Tojson = JSON.parse(JSON.stringify(results));

      if (Tojson[0].writer === userid) {
        const Modsql =
          "UPDATE board SET title = '" +
          title +
          "' , contents = '" +
          contents +
          "'  WHERE menu='" +
          menu +
          "' AND idx=" +
          idx +
          ";";

        con.query(Modsql, (err, results) => {
          try {
            return res.send("/");
          } catch (exception) {
            return res.send("error");
          }
        });
      } else return res.send("error");
    } catch (exception) {
      return res.send("error");
    }
  });
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시글 삭제
router.route("/Post_Delete").get(function (req, res) {
  const idx = req.query.PostNum;
  const menu = req.query.BoardPath;
  const userid = req.query.user_id;
  const sql =
    "SELECT writer FROM board WHERE menu='" + menu + "' AND idx=" + idx + ";";

  con.query(sql, (err, results) => {
    try {
      const Tojson = JSON.parse(JSON.stringify(results));
      if (Tojson[0].writer === userid) {
        const Delsql =
          "DELETE FROM board WHERE menu='" + menu + "' AND idx=" + idx + ";";
        con.query(Delsql, (err, results) => {
          try {
            const CommentlDelsql =
              "DELETE FROM comment WHERE menu='" +
              menu +
              "' AND target=" +
              idx +
              ";";
            con.query(CommentlDelsql, (err, results) => {});
            return res.send("/");
          } catch (exception) {
            return res.send("error");
          }
        });
      } else return res.send("error");
    } catch (exception) {
      return res.send("error");
    }
  });
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 추천 기능
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
      try {
        const Tojson = JSON.parse(JSON.stringify(results));
        Query_id = Tojson[0].id;

        console.log(
          "Get " + menu + "의 " + idx + "번글 " + userid + "님이 추천"
        );

        // 일반 게시판일때
        const sql =
          "SELECT recommend, recommend_users FROM board WHERE menu='" +
          menu +
          "' AND idx=" +
          idx +
          " order by idx asc";

        con.query(sql, [idx, menu, userid, state], (err, results) => {
          try {
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
              con.query(RecommendUpdatesql, (err, results) => {
                try {
                } catch (exception) {
                  return res.send("error");
                }
              });

              const Userfindsql =
                "SELECT recommend_users FROM board WHERE menu='" +
                menu +
                "' AND idx=" +
                idx;

              let TempString = "/";
              let Userupdatesql = "";
              con.query(Userfindsql, (err, results) => {
                try {
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
                  con.query(Userupdatesql, (err, results) => {
                    try {
                    } catch (exception) {
                      return res.send("error");
                    }
                  });
                  return res.send({
                    state: false,
                    Recommend_count: Recommend_count - 1,
                  });
                } catch (exception) {
                  return res.send("error");
                }
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
          } catch (exception) {
            return res.send("error");
          }
        });
      } catch (exception) {
        return res.send("error");
      }
    });
  }
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 메인페이지 데이터
router.route("/Home").get(function (req, res) {
  console.log("Get Home");
  let ResJson = [];
  // 일반 게시판일때
  const Noticesql =
    "SELECT title,contents,idx,date FROM board WHERE menu='공지사항' order by idx desc LIMIT 3";

  const FreeForumsql =
    "SELECT title,contents,idx,date FROM board WHERE menu='자유게시판' order by idx desc LIMIT 3";

  const QuestionForumsql =
    "SELECT title,contents,idx,date FROM board WHERE menu='질문게시판' order by idx desc LIMIT 3";

  const AdvertisingForumsql =
    "SELECT title,contents,idx,date FROM board WHERE menu='홍보게시판' order by idx desc LIMIT 3";

  const Gallerysql =
    "SELECT title,idx,date,path,filename FROM board WHERE menu='2021' order by idx desc LIMIT 3";

  con.query(Noticesql, (err, results) => {
    const Tojson = JSON.parse(JSON.stringify(results));
    if (err) throw err;
    ResJson.push(Tojson);

    con.query(FreeForumsql, (err, results) => {
      const Tojson = JSON.parse(JSON.stringify(results));
      if (err) throw err;
      ResJson.push(Tojson);

      con.query(QuestionForumsql, (err, results) => {
        const Tojson = JSON.parse(JSON.stringify(results));
        if (err) throw err;
        ResJson.push(Tojson);

        con.query(AdvertisingForumsql, (err, results) => {
          const Tojson = JSON.parse(JSON.stringify(results));
          if (err) throw err;
          ResJson.push(Tojson);
          con.query(Gallerysql, (err, results) => {
            const Tojson = JSON.parse(JSON.stringify(results));
            if (err) throw err;
            ResJson.push(Tojson);
            return res.send(ResJson);
          });
        });
      });
    });
  });
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 크롤링 테스트 페이지
router.route("/Crawling").get(function (req, res) {
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

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 라우팅 ( 마지막에 써줘야함 )
app.use("/", router);

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 잘못된 요청
app.all("*", function (req, res) {
  res.send("error");
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 리슨
app.listen(port, () => console.log("Example app listening on  " + port));
