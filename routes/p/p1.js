module.exports = function(app) {
    const express = require('express');
    var route = express.Router();
    // p1 으로 시작하는 요청은 router 에게 위임
    route.get('/r1', function(req, res) {
        res.send('Hello /p1/r1');
    });

    route.get('/r2', function(req, res) {
        res.send('Hello /p1/r2');
    });

    return route;
} 