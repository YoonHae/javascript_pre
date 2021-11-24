// 환경 변수
const path = require('path');
global.custom_env = require(path.join(process.cwd(), 'settings/env.js'));
global.__workdir = __dirname;

var app = require('./config/express')();
var passportRout = require('./config/passport')(app);
var authRoute = require('./service/auth')(app, passportRout);
var topicRoute = require('./service/topic')(app);
app.use('/auth', authRoute);
app.use('/topic', topicRoute);

app.get('/welcome', function(req, res) {
    // passport 가 req 가 user 를 등록해준다.
    if(req.user && req.user.displayName) {
        res.send(`
            <h1>Hello, ${req.user.displayName}</h1>
            <p> <a href="/topic"> topic </a> </p>
            <a href="/auth/logout">logout</a>
        `);
    } else {
        res.send(`
            <h1>Welcome</h1>
            <a href="/auth/login">login</a>
            <a href="/auth/register">register</a>
        `);
    }
});


app.listen(3000, function() {
    console.log('run!!')
});