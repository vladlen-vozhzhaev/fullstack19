import {connection} from "../dbHelper.js";
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
}