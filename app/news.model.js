const db = require("../db/connection")

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics`)
    .then(result => result.rows)
}

exports.selectArticleById = (article_id) => {
    return db
    .query(
        `SELECT author, title, article_id, body,
         topic, created_at, votes, article_img_url
          FROM articles WHERE article_id = $1`,
           [article_id])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({status : 404, msg: "Article not found"})
        }
        return result.rows[0]
    })
}