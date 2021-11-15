var express = require('express');
var app = express();

// 쿠키를 사용할 수 있는 모듈 등록
var cookieParser = require('cookie-parser');
app.use(cookieParser());  // 미들웨어에 등록

app.get('/count', function(req, res) {
    var count = req.cookies.count;  // client 가 전달한 cookies
    if (count) {
        count = parseInt(req.cookies.count);
    } else {
        count = 1;
    }
    // client 에게 갱신한 cookie 데이터 반환
    res.cookie('count', count + 1);
    res.send('count : '+count);
});



app.listen(3000, function() {
    console.log('run!!')
});