const express = require('express');
const session = require('express-session')
const HmacSHA256 = require('crypto-js/hmac-sha256');
const mysql = require("mysql2");
const multer = require("multer");
const cookieParser = require('cookie-parser');
const {engine} = require('express-handlebars');
const app = express()
const port = 3000
app.use(cookieParser('secret key'))
app.use(express.static(`${__dirname}/public`));
app.engine('handlebars', engine());
app.set('views', './views')
app.set('view engine', 'handlebars')

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "fullstack19",
    password: ""
});



connection.connect(function (err) {
    if (err) {
        return console.error(err.message);
    } else
        console.log("success");
});

app.get('/', (req, res) => {
    res.render('home', { title: 'Greetings form Handlebars' })
});
app.get('/cabinet', (req, res) => {
    console.log('Cookie: ', req.cookies['token']);
    if(req.cookies['token'] === '12345ABCDE'){
        res.send('Личный кабинет');
    }else{
        res.send('Доступ запрещен');
    }

});
app.get('/reg', (req, res)=>{
    res.sendFile(__dirname + "/reg.html")
})
app.get('/login', (req, res)=>{
    res.sendFile(__dirname + "/auth.html")
})
app.post('/reg', multer().fields([]), (req, res)=>{
    let sendResult  = "success";
    let email = req.body.email.toLowerCase();
    connection.query("SELECT id FROM users WHERE email=?", [email], function (err, res1){
        console.log(res1.length);
        if(res1.length){
            console.log("exist");
            sendResult = "exist";
            res.send(sendResult);
        }else{
            let pass = (HmacSHA256(req.body.pass, 'secret').toString());
            const user = [req.body.name, req.body.lastname, email, pass];
            connection.query("INSERT INTO `users`(`name`, `lastname`, `email`, `pass`) VALUES (?,?,?,?)", user,
                function (error, result, metadata) {
                    console.log(error);
                    console.log(result);
                    res.send(sendResult);
                })
        }
    });

})
app.post('/login', multer().fields([]), (req,res )=>{
    let email = req.body.email.toLowerCase();
    connection.query("SELECT * FROM users WHERE email=?", [email], function (err, res1){
        console.log(res1);
        if(res1.length){
            let pass = (HmacSHA256(req.body.pass, 'secret').toString());
            if(pass === res1[0].pass){
                res.cookie('token', '12345ABCDE');
                res.send("success");
            }else {
                res.send("error");
            }
        }
        else{
            res.send("error");
        }
    });
});

app.get('/logout', (req, res)=>{
    res.clearCookie('token');
    res.send('success');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})