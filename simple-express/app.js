//** express */
var express = require('express');
var app = express();
app.locals.pretty = true; // 리턴되는 데이터의 들여쓰기 등을 미려하게 하도록 설정

//** utils */
var path = require("path");  // 경로관련 모듈 사용

//** template */
app.set('view engine', 'jade');  // express 에 템플릿 엔진 연결
app.set('views', path.join(__dirname, 'views'));  // 템플릿으로 사용할 view 파일 폴더 설정 // __dirname 는 실행폴더경로


//** static file service */
app.use(express.static(path.join(__dirname, 'public')));  // 정적 파일 서비스하기위한 미들웨어에 경로 설정

/** body parser - middleware */
var bodyParser = require('body-parser');  // post 를 사용할 때 body 를 사용하기위해 추가적으로 사용하는 모듈
app.use(bodyParser.urlencoded({extended: false }));  // body 에 데이터가 있으면 파싱하여 req 에 body 로 구성해줌


//** GET - basic */
// req: 요청정보 객체,  res: 응답할때 이용할 객체
app.get('/', function(req, res) {
    res.send('this is main'); // 기본적인 응답 데이터를 반환할때 사용
});


//** GET - template */
app.get('/template', function(req, res) {
    jadeParams = {time: Date()};  // jade 파일에 전달할 파라미터
    res.render('temp', jadeParams);  // views/temp.jade 템플릿 파일에 파라미터 매핑해서 리턴
});

//** post - template */
app.post('/form_receiver', function(req, res){
    var title = req.body.title;
    var description = req.body.description;

    res.send(title  + ', ' + description);
});

//** GET - using form */
app.get('/form', function(req, res) {
    res.render('form'); 
});


//** GET - semantic url */ 
app.get('/topic/:id', function(req, res) {
    // query string 의 경우 req.query 를 사용
    // semantic url 에 구성한 파라미터의 경우 req.params 를 사용
    res.send('query.id = ' + req.query.id + ", params.id = " + req.params.id);
});


app.get('/logo', function(req, res) {
    // 정적 서비스를 위한 public 폴더 내의 파일을 참조하여 반환
    res.send('logo~~ <img src="/chrome.png">');
});

app.get('/login', function(req, res) {
    res.send('<h1>login please</h1>');
});

//** run server */
app.listen(3000, function() {
    console.log('Connected 3000 port!!')
});