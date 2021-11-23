var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

// 환경 변수
const path = require('path');
const config = require(path.join(process.cwd(), 'settings/env.js'));

//** 세션 사용에 필요한 모듈s */ 
// 기본 세션사용을 위한 모듈
var session = require('express-session');  
// 세션정보 저장을 위해 사용하는 모듈
var mysqlStore = require('express-mysql-session')(session);

app.use(session({
    secret: '1243432#432432@$%',  // 쿠키에 사용될 데이터의 암복호화 키
    resave: false,  // 접속할때마다 재발급하지 않기.
    saveUninitialized: true, // 세션 사용전까지 사용하지않기.

    // 추가적인 저장용 모듈을 사용하지 않으면 메모리에 저장하여 reload 시 날아간다.
    store: new mysqlStore ({  // 세션정보 저장을 위한 DB 연결정보
            host: config.DB_CONFIG.host,
            port: config.DB_CONFIG.port,
            user: config.DB_CONFIG.user,
            password: config.DB_CONFIG.password,
            database: config.DB_CONFIG.database
        })
}));

// password 암호화에 사용할 암호화 모듈
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

const mysql = require('mysql');
const conn = mysql.createConnection({
    host: config.DB_CONFIG.host,
    user: config.DB_CONFIG.user,
    password: config.DB_CONFIG.password,
    database: config.DB_CONFIG.database
});

conn.connect(function(err, args) {
    if (err)
    {
        console.log(err);
    }
});


// passport 설정! (로그인에서 활용할 수 있는 모듈)
// id/password 를 활용하는 경우 username / password 로 고정해야함
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
// 타사인증로직이 추가됨으로써 진정한 passport 의 이점이 발현됨
var FacebookStrategy = require('passport-facebook').Strategy;
app.use(passport.initialize());  // 초기화
app.use(passport.session());   // 세션 세팅 이후에 설정해야한다.

// 인증절차시 사용할 함수를 middleware 에 등록한다.
passport.use(new LocalStrategy(
    function(username, password, done) {
        var uname = username;
        var pwd = password;

        var sql = 'select * from users where authId = ?';
        conn.query(sql, ['local:'+uname], function(error, results) {
            if (error)  {
                console.log(error);
                done(null, false);
            } else if (results.length === 1) {
                var user = results[0];
                return hasher({password: pwd, salt: user.salt}, function(err, pass, salt, hash){
                    if (hash === user.password) {
                        // 첫번째 인자는  error 처리에 사용할 객체
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            } else {
                console.log('empty user');
                done(null, false);
            }
        });        
    }
));


passport.use(new FacebookStrategy({
    clientID: config.FACEBOOK_APP.id ,
    clientSecret: config.FACEBOOK_APP.code,
    // 인증관련 한단계 더
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
  },
  function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var authId = 'facebook:' + profile.id;

      var sql = 'select * from users where authId = ?';
      conn.query(sql, [authId], function(err, results){
            if (err){
                console.log(err);
                done(null, false);
            } else if(results.length === 1) {
                // 있으면 session 등록 처리
                done(null, results[0]);
            } else {
                // 없으면 regist 후 session 등록 처리
                var newUser = {
                    authId: 'facebook:' + profile.id,
                    displayName: profile.displayName
                };
                sql = 'insert into users set ?';
                conn.query(sql, newUser, function(err, results) {
                    if (err){
                        console.log(err);
                        done(null, false);
                    } else {
                        done(null, newUser);
                    }
                });
            }
      });
  }
));
//01063758406

// 위의 LocalStratege/FacebookStrategy 에 등록된 함수에서 done 이 성공으로 호출된 경우 
// LocalStratege/FacebookStrategy 내 done 의 두번째 인자가 여기 user 로 넘겨짐
passport.serializeUser(function(user, done) {
    // user 정보 중 특정정보를 세션정보에 등록시킴
    done(null, user.authId);
});


// api 호출시 아래 구현한 함수가 호출되면서 인증된 사용자인지 체크 진행
passport.deserializeUser(function(id, done) {
    console.log("deserializeUser", id);
    var sql = 'select * from users where authId=?';
    conn.query(sql, [id], function(error, results){
        if(error) {
            console.log(err);
            done('There is no user');
        } else {
            done(null, results[0]);
        }
    });
  });

app.get('/auth/login', function(req, res) {
    var output = `
        <h1>Login</h1>
        <form action="/auth/login" method="post">
            <p> <input type="text", name="username" placeholder="username"> </p>
            <p> <input type="password", name="password" placeholder="password"> </p>
            <p> <input type="submit"</p>
            <p> <a href="/auth/facebook">FACEBOOK</a></p>
        </form>
    `;
    res.send(output);
});


// 아래 기존로직 대신 passport 사용
// middleware 에 등록한 함수를 호출해줌.
app.post('/auth/login', 
        passport.authenticate('local', {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login',
            failureFlash: false
        })  );

/** 
 * 1. front 에서 /auth/facebook  을 호출
 * 2. passport 가 facebook 인증 페이지로 이동
 * 3. facebook 에서 인증절차 진행
 * 4. facebook app 에 등록한 url 과 FacebookStrategy 에 callback 으로 등록한 url 을 merge 해서 facebook 이 호출해줌
 * 5. /auth/facebook/callback 가 호출되면 성패에 따라 option 내용의 redirection 진행
*/
app.get('/auth/facebook', passport.authenticate('facebook', {scope:'email'}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/welcome',
                                      failureRedirect: '/auth/login' }));

app.get('/welcome', function(req, res) {
    // passport 가 req 가 user 를 등록해준다.
    if(req.user && req.user.displayName) {
        res.send(`
            <h1>Hello, ${req.user.displayName}</h1>
            <a href="/auth/logout">logout</a>
        `);
    } else {
        res.send(`
            <h1>Welcome</h1>
            <a href="/auth/login">login</a>
            <a href="/auth/register">register</a>
        `);
    }
});


app.get('/auth/register', function(req, res) {
    var output = `
        <h1>Login</h1>
        <form action="/auth/register" method="post">
            <p> <input type="text", name="username" placeholder="username"> </p>
            <p> <input type="password", name="password" placeholder="password"> </p>
            <p> <input type="text", name="displayName" placeholder="display name"> </p>
            <p> <input type="submit"</p>
        </form>
    `;
    res.send(output);
});

app.post('/auth/register', function(req, res) {
    var uname = req.body.username;
    var pwd = req.body.password;
    var dname = req.body.displayName;

    hasher({password: pwd}, function(err, pass, salt, hash){
        var user = {
            authId: 'local:' + uname,
            username: uname,
            password: hash,
            salt: salt,
            displayName: dname
        };
        
        conn.query('insert into users set ?', user, function(err, results) {
            if (err) {
                console.log(err);
                res.status(500);
            } else {
                // passport 의 기능으로 가입 즉시 로그인을 할 수 있다. 
                req.login(user, function(err){
                    // passport 가 session 작업을 하므로, 저장이 완료된 시점에 하는게 나음
                    req.session.save(function() {
                        res.redirect('/welcome');
                    });
                });
            }
        });
    });
});


   
app.get('/auth/logout', function(req, res) {
    // passport 의 기능으로 로그아웃 기능을 사용할 수 있다.(세선관리 포함)
    req.logout();
    // passport 가 session 작업을 하므로, 저장이 완료된 시점에 하는게 나음
    req.session.save(function() {
        res.redirect('/welcome');
    });
});



app.listen(3000, function() {
    console.log('run!!')
});