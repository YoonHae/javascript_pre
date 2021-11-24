module.exports = function(app) {
    const conn = require('./db')();

    // password 암호화에 사용할 암호화 모듈
    var bkfd2Password = require("pbkdf2-password");
    var hasher = bkfd2Password();


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
        clientID: global.custom_env.FACEBOOK_APP.id ,
        clientSecret: global.custom_env.FACEBOOK_APP.code,
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
    
    return passport;
};