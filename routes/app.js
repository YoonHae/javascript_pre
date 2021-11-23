var express = require('express');
const res = require('express/lib/response');
var app = express();

var path = require('path');

/** 1. 다른 파일로 나누어진 모듈을 router 를 이용하여 갖다쓸 수 있다. */
var p1 = require('./p/p1')(app);
var p2 = require('./p/p2')(app);
app.use('/p1', p1);
app.use('/p2', p2);

/** 2. 아래의 형태나 배열의 형태로 여러 함수를 연속하여 호출 할 수 있다. */
app.get('/test1', function(req, res, next) {
    console.log("test1");
    next();
}, function (req, res) {
    console.log("test2");
    res.send("wow!!");
});


// 3. 하나의 url 과 라우트 핸들러 체이닝으로 아래처럼 사용가능
app.route('/group')
    .get((req, res) => { res.send('GET!!!'); })
    .post((req, res) => { res.send('POST!!'); })
    .put((req, res) => { res.send('PUT!!!!'); })
    .delete((req, res) => {res.send('DELETE!!'); });


/** 4. router 에 함수를 직접 등록하면 url 과 연결된 콜백을 호출하기 전에
 *      등록한 순서대로 등록한 함수가 호출된다.
 *      이 때 중간에 누구라도 res.send() 같은 response 를 하면 다음으로 안넘어간다.
*/
var router = express.Router();
router.use(function middle1(req, res, next) {
    var time = Date.now();
    console.log('Time1: ', time);

    if (time % 2) {
        var result = next();
        console.log('next 에서 정상적으로 response 를 했으면 여기선 다신 하면 안된다!');        
    }
    else
        res.send('cut!!!!');
  });

router.use(function middle2(req, res, next) {
    var time = Date.now();
    console.log('Time2: ', time);
    next();
  });

router.use(function middle3(req, res, next) {
    var time = Date.now();
    console.log('Time3: ', time);
    next();
  });

router.get('/test2', function(req, res) {
    console.log('test2');
    res.send('test2');
});

router.get('/test3', function(req, res) {
    console.log('test2');
    res.send('test3');
});

app.use('/test', router);


/** 5. django url.py style 로 구성
 *      url 과 logic 이 파일로 분리되어 url 이 한눈에 보이는 장점이 있음.*/ 
//var logic = require(path.join(__basedir, '/logic.js'))(app);
var logic = require('./logic.js')(app);
app.get('/a', logic.a);
app.get('/b', logic.b);


app.listen(3000, function() {
    console.log("run!!!!!!!!!!!!!!!!!!!");
})
