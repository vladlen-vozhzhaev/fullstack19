const { parse } = require('node-html-parser');
const express = require('express');
const session = require('express-session')
const HmacSHA256 = require('crypto-js/hmac-sha256');
const mysql = require("mysql2");
const multer = require("multer");
const cookieParser = require('cookie-parser');
const {engine} = require('express-handlebars');
const uuid = require('uuid');
const fs = require('fs');
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
    let token = req.cookies['token']==null?undefined:req.cookies['token'];
    connection.query("SELECT * FROM users WHERE token=?",
        [token], function (err, result){
            console.log(result);
            if(result.length){
                let user = {
                    name: result[0].name,
                    lastname: result[0].lastname,
                    email: result[0].email
                }
                res.render('cabinet', {user});
            }else{
                res.send('Доступ запрещен');
            }
        })
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
                let uid = uuid.v4();
                connection.query("UPDATE users SET token = ? WHERE id = ?",
                    [uid, res1[0].id]);
                res.cookie('token', uid);
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

app.get('/addArticle', (req, res)=>{
    res.render('addArticle', {});
});

app.post('/addArticle', multer().fields([]), (req, res)=> {
    const root = parse(req.body.content);
    let imageBase64 = root.querySelector("img").getAttribute('src');
    let imageName = Date.now()+"."+imageBase64.split(",")[0].split("/")[1].split(";")[0];
    let buff = new Buffer(imageBase64.split(",")[1], 'base64');
    fs.writeFileSync(`public/img/contentImage/${imageName}`, buff);
    root.querySelector("img").setAttribute("src", `/img/contentImage/${imageName}`);
    console.log(root.toString());
    res.json({result: "success"});
   /* connection.query("INSERT INTO articles (title, content, author) VALUES (?,?,?)",
        [req.body.title, req.body.content, req.body.author],
        () => {
            res.json({result: "success"});
        });*/
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})