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

// passport 설정! (로그인에서 활용할 수 있는 모듈)
// id/password 를 활용하는 경우 username / password 로 고정해야함
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());  // 초기화
app.use(passport.session());   // 세션 세팅 이후에 설정해야한다.

// 인증절차시 사용할 함수를 middleware 에 등록한다.
passport.use(new LocalStrategy(
    function(username, password, done) {
        var uname = username;
        var pwd = password;

        for(var user of userList) {
            if (user.username == uname) {
                // hasher 호출시 salt 를 누락하고  호출하면 직접 생성하여 암호화하고 콜백에서 전달해준다.(등록시 사용)
                return hasher({password: pwd, salt: user.salt}, function(err, pass, salt, hash){
                    if (hash === user.password) {
                        // 첫번째 인자는  error 처리에 사용할 객체
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            }
        }
        done(null, false);
    }
));

// 위의 LocalStratege 에 등록된 함수에서 done 이 성공으로 호출된 경우 
// LocalStratege 내 done 의 두번째 인자가 여기 user 로 넘겨짐
passport.serializeUser(function(user, done) {
    console.log("serializeUser", user.username);
    done(null, user.username);
});


// api 호출시 아래 구현한 함수가 호출되면서 인증된 사용자인지 체크 진행
passport.deserializeUser(function(id, done) {
    console.log("deserializeUser", id);
    for(var user of userList) {
        if (user.username === id) {
            return done(null, user);
        }
    }
  });

app.get('/auth/login', function(req, res) {
    var output = `
        <h1>Login</h1>
        <form action="/auth/login" method="post">
            <p> <input type="text", name="username" placeholder="username"> </p>
            <p> <input type="password", name="password" placeholder="password"> </p>
            <p> <input type="submit"</p>
        </form>
    `;
    res.send(output);
});

var userList = [{
        username: 'admin',
        //password: 'qwer1234',
        password: 'tc2+8OSQ5E9/dr1sf4YUSO/6Jc1MGjIW6MZ9lQGPbO4MEL8qqrE9fyEIWeuV2em+T29oKVMdUkmH1rKHGyQs9i0gPNeoaiFEsrEn/0EpWRclz2vRtabDzZKd/I+PQLi7vnLufsoOoUwLpheZ22TIz37NRnM40E/g3s/aypDDyOk=',
        salt: 'yeU7hc2Nu8iWm8kiFHy/MNyWoHV9J/2rZwwf6IU9wEhVRKafu5BqkQ10JkSDXMnKo3NSvwLhE6ZPwnz0SNOT8w==',
        displayName: 'AAAAAdmin'
    }];


// 아래 기존로직 대신 passport 사용
// middleware 에 등록한 함수를 호출해줌.
app.post('/auth/login', 
        passport.authenticate('local', {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login',
            failureFlash: false
        })  );

// /// 세션에 대한 로직은 개발시 용이하게하기 위함.
// /// 실제 개발시 다른 방법을 사용해야함.
// app.post('/auth/login', function(req, res){
//     // 단순한 실습용 정보
//     var uname = req.body.username;
//     var pwd = req.body.password;

//     for(var user of userList) {
//         if (user.username == uname) {
//             // hasher 호출시 salt 를 누락하고  호출하면 직접 생성하여 암호화하고 콜백에서 전달해준다.(등록시 사용)
//             return hasher({password: pwd, salt: user.salt}, function(err, pass, salt, hash){
//                 if (hash === user.password) {
//                     // 로그인 시 welcome page 에서 사용할 별명정보 세션에 저장
//                     req.session.displayName = user.displayName;
            
//                     /* 메모리가 아닌 DB 에 저장된 경우 
//                     데이터 저장이 늦어지고 redirect 가 더 빨리 이루어져서
//                     로그인이 안된 것처럼 동작할 수 있다.
//                     save 함수의 callback 에서 redirect 하면
//                     저장 완료 후 callback 이 호출되서 정상적으로 사용이 가능하다. */
//                     req.session.save(function()  {
//                         res.redirect('/welcome');
//                     })
//                 } else {
//                     res.send('Who are you? <a href="/auth/login">login</a>');
//                 }
//             });
//         }
//     }
//     res.send('Who are you? <a href="/auth/login">login</a>');
// });


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
            username: uname,
            password: hash,
            salt: salt,
            displayName: dname
        };
        userList.push(user);

        // passport 의 기능으로 가입 즉시 로그인을 할 수 있다. 
        req.login(user, function(err){
            // passport 가 session 작업을 하므로, 저장이 완료된 시점에 하는게 나음
            req.session.save(function() {
                res.redirect('/welcome');
            });
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