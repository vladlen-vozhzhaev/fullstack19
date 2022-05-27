export class Blog{
    static connection = null;
    static getArticleById(req, res){
        let articleID = req.params['id'];
        this.connection.query("SELECT * FROM articles WHERE id=?", [articleID], (err, resultSet)=>{
            if(resultSet.length){
                let article = resultSet[0];
                res.render('article', {article})
            }else{
                res.send("404");
            }
        })
    }
}