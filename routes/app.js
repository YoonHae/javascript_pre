global.__basedir = __dirname;

var express = require('express');
var app = express();

var path = require('path');

var p1 = require(path.join(__basedir, '/p/p1'))(app);
var p2 = require(path.join(__basedir, '/p/p2'))(app);
app.use('/p1', p1);
app.use('/p2', p2);


app.listen(3000, function() {
    console.log("run!!!!!!!!!!!!!!!!!!!");
})

/*
// application level middleware
var express = require('express');
var app = express();

app.get('/p1/r1', function(req, res) {
    res.send('Hello /p1/r1');
});

app.get('/p1/r2', function(req, res) {
    res.send('Hello /p1/r2');
});

app.get('/p2/r1', function(req, res) {
    res.send('Hello /p2/r1');
});

app.get('/p2/r2', function(req, res) {
    res.send('Hello /p2/r2');
});

app.listen(3000, function() {
    console.log("run!!!!!!!!!!!!!!!!!!!");
})
*/