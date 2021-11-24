module.exports = function(app) {
    var route = require('express').Router();
    var conn = require(global.__workdir + '/config/db')();

    route.use(function(req, res, next) {
        if(req.user && req.user.displayName) {
            next();
        } else {
            res.redirect('/auth/login');
        }
    });

    route.get(['/add'], function(req, res) {
        var sql = 'select id, title from topic';
        conn.query(sql, function(err, rows, fields){
            if (err) {
                console.log(err);
                res.status(500).send('Internal server error');
            } else {
                res.render('topic/add', {topics: rows});
            }
        });
    });


    route.post('/add', function (req, res) {
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


    route.get('/:id/delete', function(req, res) {
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
                        res.render('topic/delete', {topic:idRows[0], topics: rows});
                    }
                });   
            }
        });
    });


    route.post('/:id/delete', function(req, res) {
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


    route.get('/:id/edit', function(req, res) {
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
                            res.render('topic/edit', {topic:idRows[0], topics: rows});
                        }
                    });
                } else {
                    console.log('not exists id.');
                    res.status(500).send('Internal server error');
                }
            }
        });
    });


    route.post('/:id/edit', function(req, res){
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


    route.get(['/', '/:id'], function(req, res) {
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
                            res.render('topic/view', {topic:idRows[0], topics: rows});
                        }
                    });
                } else {
                    res.render('topic/view', {topics: rows});
                }
            }
        });
    });

    return route;

}