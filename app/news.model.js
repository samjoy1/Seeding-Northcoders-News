const db = require("../db/connection")

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics`)
    .then(result => result.rows)
}

exports.selectArticleById = (article_id) => {
    return db
    .query(
        `SELECT articles.author, articles.title, articles.article_id, articles.body,
         articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::INT AS comment_count 
          FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
           [article_id])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({status : 404, msg: "Article not found"})
        }
        return result.rows[0]
    })
}

const validSortBy = [
    "author", "title", "article_id", "topic", "created_at", "votes", "article_img_url", "comment_count", "topic"
  ]

const validOrder = ["asc", "desc"]

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
    if(!validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "Invalid sort_by query"})
    }

    if (!validOrder.includes(order.toLowerCase())){
        return Promise.reject({ status: 400, msg: "Invalid order query"})
    }
    
    const queryValues = []
    let queryStr =
        `SELECT articles.author, articles.title, 
        articles.article_id, articles.topic, articles.created_at, 
        articles.votes, articles.article_img_url, COUNT(comments.comment_id) :: INT 
        AS comment_count FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id `;

        if(topic) {
            queryStr += `WHERE articles.topic = $1 `
            queryValues.push(topic)
        }

        queryStr += `GROUP BY articles.article_id ORDER BY ${sort_by} ${order.toUpperCase()}`

    return db.query(queryStr, queryValues).then((result) => {
        if (topic && result.rows.length === 0) {
            return db.query(`SELECT * FROM topics WHERE slug = $1`, [topic])
            .then(({ rows }) => {
                if (rows.length === 0) {
                    return Promise.reject({ status: 404, msg: "Topic not found"})
                } else {
                    return []
                }
            })
        }
        return result.rows
    })
}

exports.selectCommentsByArticleId = (article_id) => {
    return db 
    .query(
        `SELECT comment_id, votes, created_at, author, 
        body, article_id FROM comments WHERE article_id 
        = $1 ORDER BY created_at DESC`, [article_id]
    )
    .then((result) => {
        console.log(result.rows)
        return result.rows
    })
}

exports.insertCommentByArticleId = (article_id, username, body) => {
    return db.query(
        `INSERT INTO comments (article_id, author, body)
        VALUES ($1, $2, $3)
        RETURNING *`, [article_id, username, body]
    )
    .then((result) => result.rows[0])
}

exports.updateArticleById = (article_id, inc_votes) => {
    return db.query(
        `UPDATE articles SET votes = votes + $1 WHERE 
        article_id = $2 RETURNING *;`, [inc_votes, article_id]
    )
    .then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({status: 404, msg: "Article not found"})
        }
        return result.rows[0]
    })
}

exports.removeCommentById = (comment_id) => {
    if (isNaN(comment_id)) {
        return Promise.reject({ status: 400, msg: "Invalid input"})
    }

    return db.query(
        `DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [comment_id]
    )
    .then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Comment not found"})
        }
    })
}

exports.selectUsers = () => {
    return db.query(
        `SELECT username, name, avatar_url FROM users`
    )
    .then((result) => result.rows)
}