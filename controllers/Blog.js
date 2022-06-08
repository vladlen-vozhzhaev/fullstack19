import {connection} from "../dbHelper.js";
import {parse} from "node-html-parser";
import fs from "fs";
export class Blog{
    static getArticles(req, res){
        let conn = connection();
        conn.query("SELECT * FROM articles", (err,resultSet)=>{
            if(resultSet.length){
                res.json(resultSet);
            }else{
                res.json({});
            }
            conn.close();
        })

    }
    static getArticleById(req, res){
        let articleID = req.params['id'];
        let conn = connection();
        conn.query("SELECT * FROM articles WHERE id=?", [articleID], (err, resultSet)=>{
            if(resultSet.length){
                let article = resultSet[0];
                res.json(article);
            }else{
                res.send("404");
            }
            conn.close();
        })

    }
    static addArticle(req, res){
        const root = parse(req.body.content);
        let images = root.querySelectorAll("img");
        images.forEach((image, index)=>{
            let base64 = image.getAttribute('src');
            let imageName = Date.now()+"."+base64.split(",")[0].split("/")[1].split(";")[0];
            let buff = new Buffer(base64.split(",")[1], 'base64');
            fs.writeFileSync(`client/public/img/contentImage/${imageName}`, buff);
            root.querySelectorAll("img")[index].setAttribute("src", `/img/contentImage/${imageName}`);
        })
        console.log(root.toString());
        const conn = connection();
        conn.query("INSERT INTO articles (title, content, author) VALUES (?,?,?)",
            [req.body.title, root.toString(), req.body.author],
            () => {
                res.json({result: "success"});
                conn.close();
            });
    }
}