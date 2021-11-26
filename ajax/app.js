const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

const path = require('path');

// ejs 를 이용한 html 파일 반환
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);

app.use(express.static(path.join(__dirname, 'views')));  // 정적 파일 서비스하기위한 미들웨어에 경로 설정

app.get('/', function(req, res) {
    res.render('index.html');
});



app.listen(3000, function() {
    console.log("run!!!!!!!!!!!!!!!!!!!!");
})