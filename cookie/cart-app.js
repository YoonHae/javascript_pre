var express = require('express');
var app = express();

// 쿠키를 사용할 수 있는 모듈 등록
var cookieParser = require('cookie-parser');
// 쿠키 모듈 미들웨어에 등록(암호화 키 함께 전달)
app.use(cookieParser('drfsdagefw23231'));  

// db 대신 simple 하게 
var products = {
    1: {title: 'The history of web 1'},
    2: {title: 'The next web'}
}

app.get('/products', function(req, res) {
    var output = '';
    for(var name in products) {
        output += `
        <li>
            <a href="/cart/${name}">${products[name].title}</a>
        </li>`
    }
    res.send(`<h1>Products</h1> <ul>${output}</ul> <a href="/cart">Cart</a>`);
});


app.get('/cart', function(req, res) {
    var cart = req.signedCookies.cart;
    if (!cart) {
        res.send('Empty cart');
    } else {
        var output = '';
        for(var id in cart) {
            output += `
                <li>
                    ${products[id].title} : ${cart[id]}
                </li>
            `;
        }

        res.send(`<h1>Cart</h1> <ul>${output}</ul> <a href="/products">Products</a>`);
    }
});


app.get('/cart/:id', function(req,  res) {
    var cart = req.signedCookies.cart || {};
    var id = req.params.id;
    cart[id] = cart[id] ? parseInt(cart[id]) + 1 : 1;
    res.cookie('cart', cart, {signed: true});

    res.redirect("/cart");
});


app.get('/count', function(req, res) {
    // 암호화된 쿠키 복호화하여 읽어오기
    var count = req.signedCookies.count;
    if (count) {
        count = parseInt(req.signedCookies.count);
    } else {
        count = 1;
    }
    // 쿠키 암호화하여 전달하기
    res.cookie('count', count + 1, {signed: true});
    res.send('count : '+count);
});



app.listen(3000, function() {
    console.log('run!!')
});