var express = require("express");
var app = express();
app.locals.pretty = true;

var path = require("path");
var bodyParser = require("body-parser");
var fs = require("fs");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({extended: false}));


app.get('/topic/new', function(req, res) {
    fs.readdir(path.join(__dirname, 'data'), function(err, files) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            res.render('new', {topics: files});
        }
    });
});

app.post('/topic', function(req, res) {
    var title = req.body.title;
    var description = req.body.description;

    fs.writeFile(path.join(__dirname, "data", title), description, function(err) {
        if(err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            // 명시한 url 로 redirect 한다.
            res.redirect('/topic/'+title);
        }
    });
});

//** 두개의 path 에 대하여 하나의 call 에서 처리 */
app.get(['/topic', '/topic/:id'], function(req, res) {
    // /topic/new 를 통해 생성된 파일 목록을 가져옴
    fs.readdir(path.join(__dirname, 'data'), function(err, files) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            // url 에 id 에 해당하는 데이터가 있는 경우와 없는 경우를 나눠서 코드를 다르게 구성
            var id = req.params.id;
            if (req.params.id)
            {        
                fs.readFile(path.join(__dirname, "data", id), 'utf8', function(err, data) {
                    if(err) {
                        console.log(err);
                        res.status(500).send('Internal server error');
                    } else {
                        res.render('view', {title: id, topics: files, description: data});
                    }
                });
            }
            else {
                res.render('view', {topics: files, title: 'Welcome', description: 'Node.JS with express'});
            }
        }
    });
});


app.listen(3000, function() {
    console.log("run server. port :  3000");
});