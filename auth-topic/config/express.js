module.exports = function() {
    var express = require('express');
    var app = express();

    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({extended:false}));

    // 환경 변수
    const path = require('path');

    app.set('views', path.join(global.__workdir, 'views'));
    app.set('view engine', 'jade');

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
                host: global.custom_env.DB_CONFIG.host,
                port: global.custom_env.DB_CONFIG.port,
                user: global.custom_env.DB_CONFIG.user,
                password: global.custom_env.DB_CONFIG.password,
                database: global.custom_env.DB_CONFIG.database
            })
    }));
    return app;
}