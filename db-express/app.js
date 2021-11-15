var express = require('express');
var app = express();
app.locals.pretty = true;

var path = require('path');
var bodyParser = require('body-parser');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({extended: false}));



var mysql = require('mysql');

const config = require(path.join(process.cwd(), 'settings/env.js'));

var conn = mysql.createConnection({
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


app.get(['/topic/add'], function(req, res) {
    var sql = 'select id, title from topic';
    conn.query(sql, function(err, rows, fields){
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            res.render('add', {topics: rows});
        }
    });
});


app.post('/topic/add', function (req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var sql = "insert into topic(title, description, author) values (?, ?, ?);";
    conn.query(sql, [title, description, author], function(err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            res.redirect('/topic/' + result.insertId);
        }
    });
});


app.get('/topic/:id/delete', function(req, res) {
    var sql = 'select id, title from topic';
    conn.query(sql, function(err, rows, fields){
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            var id = req.params.id;
            sql = 'select * from topic where id = ?';
            conn.query(sql, [id], function(err, idRows, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal server error');
                } else if (idRows.length === 0) {
                    console.log('not exists data');
                    res.status(500).send('Internal server error');
                } else {
                    console.log(idRows);
                    res.render('delete', {topic:idRows[0], topics: rows});
                }
            });   
        }
    });
});


app.post('/topic/:id/delete', function(req, res) {
    var id = req.params.id;
    var sql = 'delete from topic where id=?;';
    conn.query(sql, [id], function(err, rows, fields){
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            res.redirect('/topic');
        }
    });
});


app.get('/topic/:id/edit', function(req, res) {
    var sql = 'select id, title from topic';
    conn.query(sql, function(err, rows, fields){
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            var id = req.params.id;
            if (id) {
                sql = 'select * from topic where id = ?';
                conn.query(sql, [id], function(err, idRows, fields) {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Internal server error');
                    } else {
                        res.render('edit', {topic:idRows[0], topics: rows});
                    }
                });
            } else {
                console.log('not exists id.');
                res.status(500).send('Internal server error');
            }
        }
    });
});


app.post('/topic/:id/edit', function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;
    var sql = "update topic set title=?, description=?, author=? where id=?";
    conn.query(sql, [title, description, author, id], function(err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            res.redirect('/topic/' + id);
        }
    });
});


app.get(['/topic', '/topic/:id'], function(req, res) {
    var sql = 'select id, title from topic';
    conn.query(sql, function(err, rows, fields){
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        } else {
            var id = req.params.id;
            if (id) {
                sql = 'select * from topic where id = ?';
                conn.query(sql, [id], function(err, idRows, fields) {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Internal server error');
                    } else {
                        res.render('view', {topic:idRows[0], topics: rows});
                    }
                });
            } else {
                res.render('view', {topics: rows});
            }
        }
    });
});




app.listen(3000, function() {
    console.log("run!!");
});